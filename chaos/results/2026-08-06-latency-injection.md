# Experiment result: latency injection

- Classification: measured
- Status: passed bounded safety execution; latency hypothesis not load-tested
- Git SHA: `db03d6915884c880eda6552464fffb0e19fcd307`
- UTC: 2026-08-06T16:47:19Z to 2026-08-06T16:47:26Z
- Environment: single-node kind `sre-reliability-lab`, namespace `sre-lab`
- Steady state: pre-run critical-journey smoke passed
- Injection: orders-to-catalog 250 ms `NetworkChaos` created; 5-second guarded observation
- Abort result: gateway readiness remained above the abort threshold
- Cleanup: experiment deleted; no Chaos resources remained; post-suite order fulfilled
- Limitation: no concurrent fixed-rate load, so the 500 ms SLO hypothesis is not claimed
