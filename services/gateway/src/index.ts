import { initTelemetry } from "@lab/common";

initTelemetry("gateway");
const { start } = await import("./server.js");
await start();
