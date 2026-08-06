# Limitations

- A single-node kind cluster cannot validate zone failure, real cloud load balancers, storage classes, or multi-node scheduling.
- PostgreSQL and Redis are single instances; availability behavior is educational, not a production topology.
- Local Alertmanager webhooks intentionally provide no on-call escalation.
- Prometheus retains seven days locally while SLO specifications model a rolling 28-day window; a continuously running lab needs at least 28 days retention for a literal long-window budget.
- Logical dumps do not provide point-in-time recovery or production backup retention.
- Capacity measurements are specific to the recorded Docker/host resources.
- Chaos Mesh has privileged daemon requirements and is opt-in only; it must never target an external context.
