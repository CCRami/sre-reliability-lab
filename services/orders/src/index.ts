import { initTelemetry } from "@lab/common";

initTelemetry("orders");
const { start } = await import("./server.js");
await start();
