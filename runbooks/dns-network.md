# DNS or network degradation

## Impact

Services cannot reliably resolve or reach dependencies, causing latency, retry amplification, and request failures.

## Checks

Inspect CoreDNS error rate/logs, endpoint objects, pod DNS resolution, NetworkChaos status, connection errors, and downstream trace gaps.

## Immediate mitigation

Abort active DNS/network experiments and verify cleanup. Restore CoreDNS replicas only if the fault persists outside the experiment.

## Deeper diagnosis

Differentiate NXDOMAIN/SERVFAIL, missing endpoints, packet loss, injected delay, connection refusal, and timeout/retry behavior.

## Recovery verification

Resolve service names from an application pod, connect to dependencies, pass `make smoke`, and confirm DNS/error burn returns to baseline.

## Escalation

Escalate if the failure extends outside the disposable namespace or cluster marker is uncertain.

## Follow-up

Record the failed resolution/connection evidence and tune timeouts or retry budgets only after reproducing the fault.
