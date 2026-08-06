# Architecture

## User journeys

1. **Browse a product:** gateway calls catalog, which reads PostgreSQL.
2. **Accept an order:** gateway calls orders; orders validates the product through catalog, writes a pending row, and publishes a Redis Streams event.
3. **Fulfill an order:** worker consumes the event, performs an idempotent pending-to-fulfilled transition, and acknowledges the event.

Order acceptance is the primary synchronous journey. Fulfillment freshness is the primary asynchronous journey.

## Failure domains

| Boundary           | User impact                             | Representative signals                   |
| ------------------ | --------------------------------------- | ---------------------------------------- |
| Gateway            | All public journeys unavailable         | request errors, latency, pod readiness   |
| Catalog/PostgreSQL | Product reads and order validation fail | dependency spans, DB pool, SQL latency   |
| Orders/PostgreSQL  | Orders cannot be accepted or queried    | error-budget burn, pool saturation       |
| Redis              | Accepted orders cannot be queued        | enqueue errors, Redis health             |
| Worker/Redis       | Orders remain pending                   | queue age, fulfillment duration, retries |

The application deliberately uses one PostgreSQL instance for a compact local lab. This is a shared failure domain, not a recommended production topology.

## Delivery semantics

Redis Streams uses a consumer group and at-least-once delivery. The worker update is guarded by `status = 'pending'`, making duplicate delivery idempotent. Failed processing stays pending for redelivery until the configured attempt policy moves it to the dead-letter stream.

HTTP routes are normalized before becoming metric labels. Order and product IDs are permitted in structured logs and trace attributes only where investigation needs them; they are never metric dimensions.
