import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { AggregationType, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

let sdk: NodeSDK | undefined;

export function initTelemetry(serviceName: string): void {
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT || sdk) return;
  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: process.env.SERVICE_VERSION ?? "dev",
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.DEPLOYMENT_ENVIRONMENT ?? "development",
    }),
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 10_000,
    }),
    views: [
      {
        meterName: "sre-reliability-lab",
        instrumentName: "lab.http.server.request.duration",
        aggregation: {
          type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
          options: { boundaries: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10] },
        },
      },
      {
        meterName: "sre-reliability-lab",
        instrumentName: "lab.order.fulfillment.duration",
        aggregation: {
          type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
          options: { boundaries: [1, 5, 10, 30, 60, 120, 300] },
        },
      },
    ],
    instrumentations: [
      getNodeAutoInstrumentations({ "@opentelemetry/instrumentation-fs": { enabled: false } }),
    ],
  });
  sdk.start();
  process.once("SIGTERM", () => void sdk?.shutdown());
}
