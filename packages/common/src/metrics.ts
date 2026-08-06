import {
  metrics,
  type Attributes,
  type Counter,
  type Histogram,
  type ObservableCallback,
  type ObservableGauge,
} from "@opentelemetry/api";

const meterName = "sre-reliability-lab";

function lazyCounter(name: string, description: string): Pick<Counter, "add"> {
  let instrument: Counter | undefined;
  return {
    add(value: number, attributes?: Attributes): void {
      instrument ??= metrics.getMeter(meterName).createCounter(name, { description });
      instrument.add(value, attributes);
    },
  };
}

function lazyHistogram(
  name: string,
  description: string,
  unit?: string,
): Pick<Histogram, "record"> {
  let instrument: Histogram | undefined;
  return {
    record(value: number, attributes?: Attributes): void {
      instrument ??= metrics
        .getMeter(meterName)
        .createHistogram(name, unit ? { description, unit } : { description });
      instrument.record(value, attributes);
    },
  };
}

function lazyGauge(name: string, description: string): Pick<ObservableGauge, "addCallback"> {
  let instrument: ObservableGauge | undefined;
  return {
    addCallback(callback: ObservableCallback): void {
      instrument ??= metrics.getMeter(meterName).createObservableGauge(name, { description });
      instrument.addCallback(callback);
    },
  };
}

// Instruments are deliberately resolved on first use. The common package is imported before
// NodeSDK.start(), so eager instruments would remain attached to the initial no-op meter provider.
export const ordersTotal = lazyCounter("lab.orders", "Orders accepted or rejected by outcome");
export const fulfillmentDuration = lazyHistogram(
  "lab.order.fulfillment.duration",
  "Seconds from order acceptance to fulfillment",
  "s",
);
export const workerRetries = lazyCounter("lab.worker.retries", "Worker retry attempts");
export const workerDeadLetters = lazyCounter(
  "lab.worker.dead_letters",
  "Events moved to the dead-letter stream",
);
export const fulfillmentOutcomes = lazyCounter(
  "lab.order.fulfillment",
  "Fulfillment completions by freshness outcome",
);
export const httpRequests = lazyCounter(
  "lab.http.server.requests",
  "HTTP requests by normalized route and status class",
);
export const httpDuration = lazyHistogram(
  "lab.http.server.request.duration",
  "HTTP request duration by normalized route",
  "s",
);
export const queueDepth = lazyGauge(
  "lab.queue.depth",
  "Number of pending or unread events in the fulfillment consumer group",
);
export const queueOldestAge = lazyGauge(
  "lab.queue.oldest.age",
  "Age in seconds of the oldest pending or unread fulfillment event",
);
export const databasePoolConnections = lazyGauge(
  "lab.db.pool.connections",
  "PostgreSQL pool connections by state",
);
