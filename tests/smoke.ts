import assert from "node:assert/strict";

const baseUrl = process.env.BASE_URL ?? "http://localhost:8080";
const productId = "11111111-1111-4111-8111-111111111111";

const ready = await fetch(`${baseUrl}/health/ready`);
assert.equal(ready.status, 200, "gateway should be ready");

const created = await fetch(`${baseUrl}/api/orders`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ productId, quantity: 1 }),
});
if (created.status !== 202) {
  throw new Error(`order creation failed with ${created.status}: ${await created.text()}`);
}
const order = (await created.json()) as { orderId: string; status: string };
assert.equal(order.status, "pending");

const deadline = Date.now() + 15_000;
while (Date.now() < deadline) {
  const response = await fetch(`${baseUrl}/api/orders/${order.orderId}`);
  assert.equal(response.status, 200);
  const state = (await response.json()) as { status: string };
  if (state.status === "fulfilled") {
    console.log(JSON.stringify({ result: "pass", orderId: order.orderId, status: state.status }));
    process.exit(0);
  }
  await new Promise((resolve) => setTimeout(resolve, 250));
}
throw new Error(`Order ${order.orderId} did not become fulfilled before the deadline`);
