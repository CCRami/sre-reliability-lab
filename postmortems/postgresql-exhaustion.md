# PostgreSQL exhaustion drill

- Status: pending measured execution
- Classification: procedure (not evidence)
- Fault: bounded database latency/saturation during constant order traffic
- Expected impact: elevated or failed order acceptance; no duplicate persisted orders
- Detection sources: availability/latency burn, PostgreSQL backends, pool state, request traces
- Timeline: fill from UTC telemetry and operator notes
- Response and mitigation: fill from actions actually taken
- Contributing factors: fill only after diagnosis
- Recovery verification: fault absent, alert resolved, pool stable, new order fulfilled
- Corrective actions, owner, due date: assign after drill
- Follow-up validation date: assign after drill
