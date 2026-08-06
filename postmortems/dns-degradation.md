# Orders-to-catalog DNS degradation drill

- Status: pending measured execution
- Classification: procedure (not evidence)
- Fault: bounded DNS errors for catalog lookups from orders
- Expected impact: explicit 503 responses and availability-budget use without state corruption
- Detection sources: DNS/network alert, CoreDNS metrics, `dns.lookup` spans, order responses
- Timeline: fill from UTC telemetry and operator notes
- Response and mitigation: fill from actions actually taken
- Contributing factors: fill only after diagnosis
- Recovery verification: DNS resolves, alert clears, new cross-service trace succeeds
- Corrective actions, owner, due date: assign after drill
- Follow-up validation date: assign after drill
