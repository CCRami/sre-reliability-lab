# Fulfillment freshness burn

## Impact

Accepted orders are completing later than the 30-second objective. Order acceptance may remain healthy while users see pending state.

## Checks

1. Check fulfillment outcome rate, duration histogram, queue depth, and worker replica readiness.
2. Inspect worker logs for retry or dead-letter events.
3. Query pending order age and Redis consumer-group pending entries.

## Immediate mitigation

Restore the worker deployment and remove an active queue/dependency fault. Increase bounded worker concurrency only if PostgreSQL and CPU have headroom.

## Deeper diagnosis

Inspect Redis consumer lag, poison messages, worker database spans, retry cadence, dead-letter stream, and idempotent update results.

## Recovery verification

Confirm queue depth drains, new orders fulfill inside 30 seconds, old pending rows are accounted for, and the alert resolves.

## Escalation

Escalate to the worker/Redis owner when the queue is growing despite healthy consumers or messages cannot be safely replayed.

## Follow-up

Record maximum queue age and drain time. Track retry, concurrency, or dead-letter corrective actions with an owner and due date.
