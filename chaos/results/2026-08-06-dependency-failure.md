# Experiment result: dependency failure

- Classification: measured
- Status: passed bounded safety execution; 503-rate hypothesis not load-tested
- Git SHA: `db03d6915884c880eda6552464fffb0e19fcd307`
- UTC: 2026-08-06T16:47:26Z to 2026-08-06T16:47:33Z
- Environment: single-node kind `sre-reliability-lab`, namespace `sre-lab`
- Steady state: pre-run critical-journey smoke passed
- Injection: 100% orders-to-catalog loss `NetworkChaos` created; 5-second guarded observation
- Abort result: gateway readiness remained above the abort threshold
- Cleanup: experiment deleted; no Chaos resources remained; post-suite order fulfilled
- Limitation: no concurrent order traffic was recorded during injection, so response distribution is not claimed
