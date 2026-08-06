# Order latency burn

## Impact

Successful order requests are taking longer than 500 ms and consuming the 95% latency budget.

## Checks

1. Use the RED dashboard to confirm p95 by service and route.
2. Open representative slow traces and identify the longest downstream span.
3. Compare CPU throttling, database connections/query duration, and Redis latency.

## Immediate mitigation

Stop the active latency or pressure experiment. Scale the constrained stateless service if capacity is the cause; roll back a regressing release when the timing matches a change.

## Deeper diagnosis

Check for queueing in connection pools, DNS retries, event-loop saturation, lock contention, and timeout mismatch between gateway and downstream services.

## Recovery verification

Run a baseline k6 profile, confirm p95 is under 500 ms and error rate remains acceptable, and verify both burn windows recover.

## Escalation

Escalate to the owner of the longest dependency span if no safe mitigation is available within 10 minutes.

## Follow-up

Capture before/after traces and load summaries; create a dated action for the controlling bottleneck.
