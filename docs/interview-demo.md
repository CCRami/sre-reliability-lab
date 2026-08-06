# Interview demonstration

1. `make bootstrap` and place one order through `http://localhost:8080`.
2. Open Grafana with `make observability-access`; show order SLO budget, service RED, infrastructure USE, and dependency panels.
3. Copy the order trace ID from its JSON log, open the trace in Tempo, and demonstrate trace-to-Loki and Loki-to-Tempo navigation.
4. Explain 28-day error budgets and the 14.4x/6x/3x multi-window alerts, including low-volume guards and diagnostic inhibition.
5. Run the guarded pod-termination experiment and show availability versus pod telemetry.
6. Show a measured load report, the worker backlog before/after comparison, one blameless postmortem, and the isolated restore checksum result.
7. End with `make teardown`, which refuses any context except the named disposable kind cluster.

The full version requires completed evidence. Before that point, demonstrate only verified components and call the remaining drill reports pending.
