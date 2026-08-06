import Fastify from "fastify";
import { ZodError } from "zod";
import { DependencyError, NotFoundError } from "./errors.js";
import { createLogger } from "./logger.js";
import { httpDuration, httpRequests } from "./metrics.js";

export type ReadinessCheck = () => Promise<void>;

export function createServer(service: string, readiness: ReadinessCheck) {
  const app = Fastify({ loggerInstance: createLogger(service) });

  app.addHook("onResponse", (request, reply, done) => {
    const attributes = {
      service,
      route: request.routeOptions.url,
      method: request.method,
      status_class: `${Math.floor(reply.statusCode / 100)}xx`,
    };
    httpRequests.add(1, attributes);
    httpDuration.record(reply.elapsedTime / 1_000, attributes);
    done();
  });

  app.get("/health/live", () => ({ status: "ok", service }));
  app.get("/health/ready", async (_request, reply) => {
    try {
      await readiness();
      return { status: "ready", service };
    } catch (error) {
      app.log.warn({ err: error }, "readiness check failed");
      return reply.code(503).send({ status: "not-ready", service });
    }
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) return reply.code(400).send({ error: "invalid_request" });
    if (error instanceof NotFoundError) return reply.code(404).send({ error: "not_found" });
    if (error instanceof DependencyError) {
      request.log.warn({ err: error }, "dependency unavailable");
      return reply.code(503).send({ error: "dependency_unavailable" });
    }
    request.log.error({ err: error }, "unhandled request error");
    return reply.code(500).send({ error: "internal_error" });
  });

  return app;
}

export async function listen(
  app: ReturnType<typeof createServer>,
  defaultPort: number,
): Promise<void> {
  const port = Number.parseInt(process.env.PORT ?? String(defaultPort), 10);
  await app.listen({ port, host: "0.0.0.0" });

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "shutting down");
    await app.close();
    process.exit(0);
  };
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdown("SIGINT"));
}
