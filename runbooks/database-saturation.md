# Database saturation

## Impact

PostgreSQL connections exceed 80% of the configured maximum. Requests can queue, time out, or fail and workers may stop progressing.

## Checks

Inspect active/idle connections, long-running queries, locks, per-service pool sizes, query spans, CPU, memory, disk, and recent traffic.

## Immediate mitigation

Stop database fault/load injection. Reduce offered load or scale down runaway clients; terminate only confirmed abandoned lab sessions.

## Deeper diagnosis

Find pool multiplication across replicas, leaked clients, lock waits, slow statements, missing indexes, and mismatched request/statement timeouts.

## Recovery verification

Confirm connection use is below threshold, smoke orders succeed and fulfill, query latency recovers, and no transaction remains unexpectedly open.

## Escalation

Escalate before modifying persistent data or terminating unknown sessions.

## Follow-up

Capture `pg_stat_activity`, measured saturation point, and a bounded-pool or query corrective action.
