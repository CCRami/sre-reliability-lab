# Queue backlog

## Impact

More than 100 fulfillment events are queued, risking delayed completion and freshness-budget burn.

## Checks

Check worker availability and concurrency, Redis consumer-group pending entries, dead letters, database latency, CPU, and enqueue/ack rates.

## Immediate mitigation

Stop queue fault injection, restore workers, and scale bounded concurrency only while downstream saturation remains safe.

## Deeper diagnosis

Identify whether arrivals exceed service rate, consumers are blocked, poison events are retrying, or acknowledgements fail after database updates.

## Recovery verification

Verify the queue trends toward zero, pending orders become terminal exactly once, and fulfillment duration returns inside objective.

## Escalation

Escalate if messages require manual replay or the dead-letter stream grows.

## Follow-up

Record arrival rate, drain rate, maximum depth, and the tested safe worker concurrency.
