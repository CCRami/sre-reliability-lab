# Cross-service trace and correlated logs

- Classification: measured
- Git SHA: `db03d6915884c880eda6552464fffb0e19fcd307`
- Captured UTC: 2026-08-06T16:48:49Z
- Environment: single-node kind `sre-reliability-lab`
- Trace ID: `d767c026eb1d61788240cf7cc2800b57`
- Tempo services returned: `catalog`, `gateway`, `orders`, `worker`
- Loki query: `{service_name="gateway"} |= "d767c026eb1d61788240cf7cc2800b57"`
- Correlated gateway log lines returned: 2 (request start and completion)
- Source: critical-journey smoke, Tempo `/api/traces/:id`, Loki `/loki/api/v1/query_range`

The trace also includes HTTP, DNS/TCP, Redis `XADD`, and `fulfillment.process` spans. This artifact records identifiers and counts rather than exporting high-cardinality raw telemetry.
