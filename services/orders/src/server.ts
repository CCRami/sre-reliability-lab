import { context, propagation } from "@opentelemetry/api";
import {
  createDatabasePool,
  createOrderSchema,
  createServer,
  DependencyError,
  listen,
  NotFoundError,
  ordersTotal,
  requiredEnv,
} from "@lab/common";
import { createClient } from "redis";
import { z } from "zod";

const orderParams = z.object({ id: z.uuid() });

export async function start(): Promise<void> {
  const pool = createDatabasePool();
  const redis = createClient({ url: requiredEnv("REDIS_URL") });
  redis.on("error", (error) => app.log.error({ err: error }, "redis client error"));
  await redis.connect();

  const catalogUrl = requiredEnv("CATALOG_URL");
  const app = createServer("orders", async () => {
    await Promise.all([pool.query("SELECT 1"), redis.ping()]);
  });

  app.post("/orders", async (request, reply) => {
    const input = createOrderSchema.parse(request.body);
    let response: Response;
    try {
      response = await fetch(`${catalogUrl}/products/${input.productId}`, {
        signal: AbortSignal.timeout(1_500),
      });
    } catch (error) {
      ordersTotal.add(1, { outcome: "dependency_error" });
      throw new DependencyError("Catalog request failed", { cause: error });
    }
    if (response.status === 404) throw new NotFoundError("Product does not exist");
    if (!response.ok) throw new DependencyError(`Catalog returned ${response.status}`);

    const product = (await response.json()) as { priceCents: number };
    const inserted = await pool.query<{ id: string; status: string }>(
      `INSERT INTO orders (product_id, quantity, unit_price_cents, status)
       VALUES ($1, $2, $3, 'pending') RETURNING id, status`,
      [input.productId, input.quantity, product.priceCents],
    );
    const order = inserted.rows[0];
    if (!order) throw new Error("Order insert returned no row");

    const carrier: Record<string, string> = {};
    propagation.inject(context.active(), carrier);
    try {
      await redis.xAdd("fulfillment.jobs", "*", {
        eventVersion: "1",
        orderId: order.id,
        enqueuedAt: new Date().toISOString(),
        traceparent: carrier.traceparent ?? "",
        tracestate: carrier.tracestate ?? "",
        attempt: "0",
      });
    } catch (error) {
      await pool.query("UPDATE orders SET status = 'failed', updated_at = now() WHERE id = $1", [
        order.id,
      ]);
      ordersTotal.add(1, { outcome: "queue_error" });
      throw new DependencyError("Unable to enqueue fulfillment", { cause: error });
    }
    ordersTotal.add(1, { outcome: "accepted" });
    return reply.code(202).send({ orderId: order.id, status: order.status });
  });

  app.get("/orders/:id", async (request) => {
    const { id } = orderParams.parse(request.params);
    const result = await pool.query<{
      id: string;
      status: string;
      created_at: Date;
      updated_at: Date;
    }>("SELECT id, status, created_at, updated_at FROM orders WHERE id = $1", [id]);
    const order = result.rows[0];
    if (!order) throw new NotFoundError(`Order ${id} does not exist`);
    return {
      orderId: order.id,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };
  });

  app.addHook("onClose", async () => {
    await redis.quit();
    await pool.end();
  });
  await listen(app, 8082);
}
