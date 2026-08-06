# Incident drills and improvement loop

The lab uses three repeatable drills: PostgreSQL connection/latency exhaustion affecting acceptance, worker loss producing fulfillment backlog, and DNS failure between orders and catalog. Each begins with the smoke probe and a fixed k6 workload, records the Prometheus/Grafana start time, runs one bounded fault, and verifies recovery with a new fulfilled order plus cleared alerts.

## Queue improvement comparison

The baseline Helm values use one worker process with `WORKER_CONCURRENCY=1`. The improvement run changes only worker concurrency to 4 while retaining capped exponential retry (`WORKER_MAX_ATTEMPTS=5`) and the dead-letter stream. Compare identical workload SHA, rate, duration, and fault window. Report backlog peak, oldest-message age, drain time after cleanup, p95 fulfillment duration, retry count, dead letters, and freshness SLO. A change is an improvement only if drain time and freshness improve without raising duplicate fulfillment or resource saturation.

## Drill command sequence

1. Record git SHA, host resources, cluster state, and baseline queries.
2. Start a parameterized k6 workload.
3. Run the allow-listed experiment with explicit acknowledgement.
4. Record detection time, alert delivery time, decisions, and mitigations.
5. Delete the experiment and verify application, queue, database, alerts, and a new trace.
6. Complete the postmortem while timestamps are available; assign owners and dated follow-ups.

Postmortem documents in `postmortems/` are deliberately marked `pending` until the matching real drill is performed. A pending file is a procedure, not portfolio evidence.
