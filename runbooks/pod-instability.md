# Pod instability

## Impact

A lab container is crash-looping, reducing capacity and potentially removing a service endpoint.

## Checks

Inspect pod status, previous logs, events, exit code, OOM state, probes, node pressure, and rollout history.

## Immediate mitigation

Stop pod/pressure experiments. Roll back a bad workload revision or restore the required dependency; avoid deleting all replicas together.

## Deeper diagnosis

Distinguish application exit, probe failure, OOM kill, image/config error, dependency startup race, and node disruption.

## Recovery verification

All desired replicas remain ready without restart growth for 10 minutes and `make smoke` passes.

## Escalation

Escalate if the StatefulSet or persistent volume is involved before forcing deletion.

## Follow-up

Attach events and previous logs to the incident record and add a regression test for the startup failure.
