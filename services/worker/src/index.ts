import { context, propagation, SpanStatusCode, trace } from "@opentelemetry/api";
import { createServer as createHttpServer } from "node:http";
import {
  createDatabasePool,
  createLogger,
  fulfillmentDuration,
  fulfillmentEventSchema,
  fulfillmentOutcomes,
  initTelemetry,
  integerEnv,
  requiredEnv,
  queueDepth,
  queueOldestAge,
  workerDeadLetters,
  workerRetries,
} from "@lab/common";
import { createClient, type RedisClientType } from "redis";
import { fulfillmentUpdateSql, retryDelayMs, shouldDeadLetter } from "./policy.js";

initTelemetry("worker");

const log = createLogger("worker");
const pool = createDatabasePool();
const redis: RedisClientType = createClient({ url: requiredEnv("REDIS_URL") });
const consumer = `${process.env.HOSTNAME ?? "local"}-${process.pid}`;
const concurrency = integerEnv("WORKER_CONCURRENCY", 1);
const maxAttempts = integerEnv("WORKER_MAX_ATTEMPTS", 5);
const claimIdleMs = integerEnv("WORKER_CLAIM_IDLE_MS", 10_000);
let running = true;
let observedQueueDepth = 0;
let observedQueueOldestAge = 0;
queueDepth.addCallback((result) =>
  result.observe(observedQueueDepth, { stream: "fulfillment.jobs" }),
);
queueOldestAge.addCallback((result) =>
  result.observe(observedQueueOldestAge, { stream: "fulfillment.jobs" }),
);

redis.on("error", (error) => log.error({ err: error }, "redis client error"));
await redis.connect();
try {
  await redis.xGroupCreate("fulfillment.jobs", "fulfillment-workers", "0", { MKSTREAM: true });
} catch (error) {
  if (!(error instanceof Error) || !error.message.includes("BUSYGROUP")) throw error;
}

const healthServer = createHttpServer((request, response) => {
  response.setHeader("content-type", "application/json");
  if (request.url === "/health/live") {
    response.writeHead(200).end(
      JSON.stringify({
        status: "ok",
        service: "worker",
        queueDepth: observedQueueDepth,
        queueOldestAgeSeconds: observedQueueOldestAge,
      }),
    );
    return;
  }
  if (request.url === "/health/ready") {
    void Promise.all([pool.query("SELECT 1"), redis.ping()])
      .then(() =>
        response.writeHead(200).end(
          JSON.stringify({
            status: "ready",
            service: "worker",
            queueDepth: observedQueueDepth,
            queueOldestAgeSeconds: observedQueueOldestAge,
          }),
        ),
      )
      .catch((error: unknown) => {
        log.warn({ err: error }, "worker readiness check failed");
        response.writeHead(503).end(JSON.stringify({ status: "not-ready", service: "worker" }));
      });
    return;
  }
  response.writeHead(404).end(JSON.stringify({ error: "not_found" }));
});
healthServer.listen(Number.parseInt(process.env.PORT ?? "8083", 10), "0.0.0.0");
const queueDepthTimer = setInterval(() => {
  void Promise.all([
    redis.xInfoGroups("fulfillment.jobs"),
    redis.xPendingRange("fulfillment.jobs", "fulfillment-workers", "-", "+", 1),
  ])
    .then(async ([groups, pending]) => {
      const group = groups.find((item) => item.name === "fulfillment-workers");
      const lag = group?.lag ?? 0;
      observedQueueDepth = (group?.pending ?? 0) + lag;
      const candidateIds = pending.map((item) => String(item.id));
      if (group && lag > 0) {
        const unread = await redis.xRange(
          "fulfillment.jobs",
          `(${String(group["last-delivered-id"])}`,
          "+",
          { COUNT: 1 },
        );
        if (unread[0]) candidateIds.push(String(unread[0].id));
      }
      const timestamps = candidateIds
        .map((id) => Number.parseInt(id.split("-")[0] ?? "", 10))
        .filter(Number.isFinite);
      observedQueueOldestAge = timestamps.length
        ? Math.max(0, (Date.now() - Math.min(...timestamps)) / 1_000)
        : 0;
    })
    .catch((error: unknown) => log.warn({ err: error }, "queue depth collection failed"));
}, 5_000);

async function processMessage(id: string, message: Record<string, string>): Promise<void> {
  const event = fulfillmentEventSchema.parse(message);
  const carrier = { traceparent: event.traceparent ?? "", tracestate: event.tracestate ?? "" };
  const parent = propagation.extract(context.active(), carrier);
  const tracer = trace.getTracer("worker");
  await tracer.startActiveSpan("fulfillment.process", {}, parent, async (span) => {
    try {
      for (let attempt = event.attempt; attempt < maxAttempts; attempt += 1) {
        try {
          const result = await pool.query<{ created_at: Date }>(fulfillmentUpdateSql, [
            event.orderId,
          ]);
          const row = result.rows[0];
          if (row) {
            const durationSeconds = (Date.now() - row.created_at.getTime()) / 1_000;
            fulfillmentDuration.record(durationSeconds);
            fulfillmentOutcomes.add(1, { outcome: durationSeconds <= 30 ? "within_30s" : "late" });
          }
          await redis.xAck("fulfillment.jobs", "fulfillment-workers", id);
          log.info({ order_id: event.orderId, message_id: id, attempt }, "order fulfilled");
          span.setStatus({ code: SpanStatusCode.OK });
          return;
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({ code: SpanStatusCode.ERROR });
          const nextAttempt = attempt + 1;
          if (shouldDeadLetter(nextAttempt, maxAttempts)) {
            await redis.xAdd("fulfillment.dead-letter", "*", {
              ...message,
              attempt: String(nextAttempt),
            });
            await pool.query(
              "UPDATE orders SET status = 'failed', updated_at = now() WHERE id = $1",
              [event.orderId],
            );
            await redis.xAck("fulfillment.jobs", "fulfillment-workers", id);
            workerDeadLetters.add(1);
            log.error({ err: error, order_id: event.orderId }, "event moved to dead-letter stream");
            return;
          }
          workerRetries.add(1, { attempt: nextAttempt });
          const delayMs = retryDelayMs(attempt);
          log.warn(
            { err: error, order_id: event.orderId, attempt: nextAttempt, delay_ms: delayMs },
            "fulfillment will be retried",
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    } finally {
      span.end();
    }
  });
}

async function consume(): Promise<void> {
  while (running) {
    const claimed = await redis.xAutoClaim(
      "fulfillment.jobs",
      "fulfillment-workers",
      consumer,
      claimIdleMs,
      "0-0",
      { COUNT: concurrency },
    );
    if (claimed.messages.length > 0) {
      await Promise.all(
        claimed.messages
          .filter((item): item is NonNullable<typeof item> => item !== null)
          .map((item) => processMessage(String(item.id), item.message as Record<string, string>)),
      );
      continue;
    }
    const streams = await redis.xReadGroup(
      "fulfillment-workers",
      consumer,
      [{ key: "fulfillment.jobs", id: ">" }],
      { COUNT: concurrency, BLOCK: 1_000 },
    );
    if (!streams) continue;
    const jobs: Promise<void>[] = [];
    for (const stream of streams) {
      const messages = stream.messages as Array<{ id: string; message: Record<string, string> }>;
      for (const item of messages) jobs.push(processMessage(item.id, item.message));
    }
    await Promise.all(jobs);
  }
}

async function shutdown(signal: string) {
  running = false;
  clearInterval(queueDepthTimer);
  log.info({ signal }, "worker shutting down");
  healthServer.close();
  await redis.quit();
  await pool.end();
}
process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));

log.info({ consumer, concurrency }, "worker started");
await consume();
