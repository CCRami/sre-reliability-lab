import pg from "pg";
import { integerEnv, requiredEnv } from "./config.js";

export function createDatabasePool(): pg.Pool {
  return new pg.Pool({
    connectionString: requiredEnv("DATABASE_URL"),
    max: integerEnv("DB_POOL_MAX", 10),
    connectionTimeoutMillis: integerEnv("DB_CONNECT_TIMEOUT_MS", 2_000),
    statement_timeout: integerEnv("DB_STATEMENT_TIMEOUT_MS", 3_000),
    application_name: process.env.OTEL_SERVICE_NAME ?? "sre-lab",
  });
}
