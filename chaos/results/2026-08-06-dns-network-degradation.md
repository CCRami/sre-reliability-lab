# Experiment result: DNS/network degradation

- Classification: measured
- Status: passed bounded safety execution; DNS impact hypothesis not load-tested
- Git SHA: `db03d6915884c880eda6552464fffb0e19fcd307`
- UTC: 2026-08-06T16:47:40Z to 2026-08-06T16:47:46Z
- Environment: single-node kind `sre-reliability-lab`, namespace `sre-lab`
- Steady state: pre-run critical-journey smoke passed
- Injection: catalog-name `DNSChaos` created for orders; 5-second guarded observation
- Abort result: gateway readiness remained above the abort threshold
- Cleanup: experiment deleted; no Chaos resources remained; post-suite order fulfilled
- Limitation: no concurrent order request was sampled during DNS failure, so 503 behavior is not claimed
