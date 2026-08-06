# Evidence policy

Only curated, reviewable artifacts belong here. Every artifact must say `measured` or `synthetic`, include environment metadata and git SHA, and identify the source command. Raw k6 data, database dumps, credentials, and high-cardinality exports remain ignored.

Required release evidence: healthy/degraded dashboards, one cross-service trace, correlated logs, burn-rate/Alertmanager delivery, promtool output, aggregate k6 profiles, six chaos reports, three completed postmortems, the worker before/after comparison, and an isolated restore result. Missing items block `v1.0.0`; placeholders are not evidence.
