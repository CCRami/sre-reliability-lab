# Worker loss and backlog drill

- Status: pending measured execution
- Classification: procedure (not evidence)
- Fault: terminate the worker during fixed accepted-order traffic
- Expected impact: acceptance remains available while queue depth/age grows and freshness degrades
- Detection sources: fulfillment SLO, queue depth/age, worker pod state, Redis metrics
- Timeline: fill from UTC telemetry and operator notes
- Response and mitigation: fill from actions actually taken
- Before/after: repeat at concurrency 1 and 4 with identical parameters
- Recovery verification: queue drains, no duplicate fulfillment, dead-letter count explained
- Corrective actions, owner, due date: assign after drill
- Follow-up validation date: assign after drill
