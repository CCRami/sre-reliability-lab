import { context, trace } from "@opentelemetry/api";
import pino from "pino";

export function createLogger(service: string) {
  return pino({
    name: service,
    level: process.env.LOG_LEVEL ?? "info",
    base: { service, environment: process.env.DEPLOYMENT_ENVIRONMENT ?? "development" },
    mixin() {
      const span = trace.getSpan(context.active());
      if (!span) return {};
      const spanContext = span.spanContext();
      return { trace_id: spanContext.traceId, span_id: spanContext.spanId };
    },
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie", "password", "token"],
      censor: "[REDACTED]",
    },
  });
}
