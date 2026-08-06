# Order availability burn

## Impact

Users are receiving server errors or dependency failures while placing orders. The page alert means the 99% availability budget is burning fast across both a short and long window.

## Checks

1. Open the SLO and Service RED dashboards; confirm error status classes and affected route.
2. Inspect a failed gateway trace and its correlated orders/catalog logs.
3. Check cause alerts, pod readiness, PostgreSQL, and Redis health.

## Immediate mitigation

Stop any active lab experiment. Roll back the most recent application release or scale a healthy affected deployment within the lab namespace. Do not restart every dependency at once.

## Deeper diagnosis

Compare gateway and downstream spans, inspect deployment events, database pool/connectivity, Redis enqueue failures, and recent configuration changes. Separate client `4xx` responses from eligible SLO traffic.

## Recovery verification

Run `make smoke`, confirm successful orders reach fulfilled, verify the short-window error ratio returns to zero, and wait for the alert to resolve.

## Escalation

The lab owner acts as incident commander. Escalate to the dependency owner recorded in the drill if mitigation does not restore the journey within 10 minutes.

## Follow-up

Open a corrective-action issue with evidence, owner, and due date; update the postmortem and rerun the same experiment after the change.
