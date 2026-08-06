# Experiment result: resource pressure

- Classification: measured
- Status: passed bounded safety execution; backlog hypothesis not load-tested
- Git SHA: `db03d6915884c880eda6552464fffb0e19fcd307`
- UTC: 2026-08-06T16:47:33Z to 2026-08-06T16:47:40Z
- Environment: single-node kind `sre-reliability-lab`, namespace `sre-lab`
- Steady state: pre-run critical-journey smoke passed
- Injection: worker CPU/memory `StressChaos` created; 5-second guarded observation
- Abort result: gateway readiness remained above the abort threshold
- Cleanup: experiment deleted; no Chaos resources remained; post-suite order fulfilled
- Limitation: the short run did not establish a queue peak or drain-time comparison
