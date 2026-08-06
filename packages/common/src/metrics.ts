import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("sre-reliability-lab");

export const ordersTotal = meter.createCounter("lab.orders", {
  description: "Orders accepted or rejected by outcome",
});
export const fulfillmentDuration = meter.createHistogram("lab.order.fulfillment.duration", {
  description: "Seconds from order acceptance to fulfillment",
  unit: "s",
});
export const workerRetries = meter.createCounter("lab.worker.retries", {
  description: "Worker retry attempts",
});
export const workerDeadLetters = meter.createCounter("lab.worker.dead_letters", {
  description: "Events moved to the dead-letter stream",
});
