# CPU or memory pressure

## Impact

Application containers are throttled or near memory limits, increasing latency and restart risk.

## Checks

Compare usage, requests, limits, throttled periods, OOM events, request rate, latency, and workload profile by pod.

## Immediate mitigation

Stop stress injection. Reduce load or add a bounded replica if the node has capacity; do not simply remove all limits.

## Deeper diagnosis

Inspect hot spans, event-loop delay, workload concurrency, garbage collection, memory growth, and request-size/cardinality changes.

## Recovery verification

Throttling and memory stabilize, restart count stops, SLO burn recovers, and a baseline load test passes.

## Escalation

Escalate when node-wide pressure affects system components or repeated OOMs risk persistent processing.

## Follow-up

Update measured resource envelopes and capacity notes rather than guessing new limits.
