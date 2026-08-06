# Experiment result: database and queue saturation

- Classification: measured
- Status: passed bounded safety execution; saturation hypothesis not load-tested
- Git SHA: `db03d6915884c880eda6552464fffb0e19fcd307`
- UTC: 2026-08-06T16:47:46Z to 2026-08-06T16:47:54Z
- Environment: single-node kind `sre-reliability-lab`, namespace `sre-lab`
- Steady state: pre-run critical-journey smoke passed
- Injection: 2-second dependency delay `NetworkChaos` created for PostgreSQL/Redis targets
- Abort result: gateway readiness remained above the abort threshold
- Cleanup: experiment deleted; no Chaos resources remained; post-suite order fulfilled
- Limitation: a 5-second observation cannot establish database-pool or queue saturation
