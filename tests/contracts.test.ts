import assert from "node:assert/strict";
import test from "node:test";
import { createOrderSchema, fulfillmentEventSchema } from "@lab/common";

void test("create-order contract accepts a bounded quantity", () => {
  const value = createOrderSchema.parse({
    productId: "11111111-1111-4111-8111-111111111111",
    quantity: 2,
  });
  assert.equal(value.quantity, 2);
});

void test("create-order contract rejects unsafe quantities", () => {
  assert.throws(() =>
    createOrderSchema.parse({
      productId: "11111111-1111-4111-8111-111111111111",
      quantity: 1000,
    }),
  );
});

void test("fulfillment event contract carries versioned trace context", () => {
  const value = fulfillmentEventSchema.parse({
    eventVersion: "1",
    orderId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    enqueuedAt: "2026-08-06T12:00:00.000Z",
    traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
    attempt: "0",
  });
  assert.equal(value.attempt, 0);
});
