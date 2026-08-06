import { context, propagation, SpanStatusCode, trace } from "@opentelemetry/api";
import {
  createDatabasePool,
  createLogger,
  fulfillmentDuration,
  fulfillmentEventSchema,
  initTelemetry,
  integerEnv,
  requiredEnv,
  workerDeadLetters,
  workerRetries,
} from "@lab/common";
import { createClient, type RedisClientType } from "redis";

initTelemetry("worker");

const log = createLogger("worker");
const pool = createDatabasePool();
const redis: RedisClientType = createClient({ url: requiredEnv("REDIS_URL") });
const consumer = `${process.env.HOSTNAME ?? "local"}-${process.pid}`;
const concurrency = integerEnv("WORKER_CONCURRENCY", 1);
const maxAttempts = integerEnv("WORKER_MAX_ATTEMPTS", 5);
let running = true;

redis.on("error", (error) => log.error({ err: error }, "redis client error"));
await redis.connect();
try {
  await redis.xGroupCreate("fulfillment.jobs", "fulfillment-workers", "0", { MKSTREAM: true });
} catch (error) {
  if (!(error instanceof Error) || !error.message.includes("BUSYGROUP")) throw error;
}

async function processMessage(id: string, message: Record<string, string>): Promise<void> {
  const event = fulfillmentEventSchema.parse(message);
  const carrier = { traceparent: event.traceparent ?? "", tracestate: event.tracestate ?? "" };
  const parent = propagation.extract(context.active(), carrier);
  const tracer = trace.getTracer("worker");
  await tracer.startActiveSpan("fulfillment.process", {}, parent, async (span) => {
    try {
      const result = await pool.query<{ created_at: Date }>(
        `UPDATE orders SET status = 'fulfilled', updated_at = now()
         WHERE id = $1 AND status = 'pending' RETURNING created_at`,
        [event.orderId],
      );
      const row = result.rows[0];
      if (row) fulfillmentDuration.record((Date.now() - row.created_at.getTime()) / 1_000);
      await redis.xAck("fulfillment.jobs", "fulfillment-workers", id);
      log.info({ order_id: event.orderId, message_id: id }, "order fulfilled");
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      const attempt = event.attempt + 1;
      if (attempt >= maxAttempts) {
        await redis.xAdd("fulfillment.dead-letter", "*", { ...message, attempt: String(attempt) });
        await redis.xAck("fulfillment.jobs", "fulfillment-workers", id);
        await pool.query("UPDATE orders SET status = 'failed', updated_at = now() WHERE id = $1", [
          event.orderId,
        ]);
        workerDeadLetters.add(1);
        log.error({ err: error, order_id: event.orderId }, "event moved to dead-letter stream");
      } else {
        workerRetries.add(1, { attempt });
        log.warn({ err: error, order_id: event.orderId, attempt }, "fulfillment will be retried");
      }
    } finally {
      span.end();
    }
  });
}

async function consume(): Promise<void> {
  while (running) {
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
  log.info({ signal }, "worker shutting down");
  await redis.quit();
  await pool.end();
}
process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));

log.info({ consumer, concurrency }, "worker started");
await consume();
