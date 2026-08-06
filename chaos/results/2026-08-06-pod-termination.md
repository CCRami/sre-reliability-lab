# Experiment result: pod termination

- Classification: measured
- Status: passed bounded safety execution; reliability hypothesis not load-tested
- Git SHA: `db03d6915884c880eda6552464fffb0e19fcd307`
- UTC: 2026-08-06T16:47:08Z to 2026-08-06T16:47:19Z
- Environment: single-node kind `sre-reliability-lab`, namespace `sre-lab`
- Hypothesis: two gateway replicas preserve availability during one pod loss
- Steady state: pre-run critical-journey smoke passed
- Injection: Chaos Mesh created `PodChaos/pod-termination`; 5-second guarded observation
- Abort result: no three-consecutive-readiness-failure abort
- Cleanup: experiment deleted; no Chaos resources remained; post-suite order fulfilled
- Limitation: no concurrent fixed-rate load, so SLO impact is not claimed
