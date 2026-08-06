import { initTelemetry } from "@lab/common";

initTelemetry("catalog");
const { start } = await import("./server.js");
await start();
