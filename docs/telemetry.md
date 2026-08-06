# Telemetry model

Application SDKs export OTLP metrics and traces to the Collector gateway. A Collector DaemonSet tails Kubernetes JSON logs and sends them through the same gateway. The gateway enriches all signals with Kubernetes metadata and `k8s.cluster.name=sre-reliability-lab`, exposes metrics for Prometheus, exports traces to Tempo, and exports logs through Loki's OTLP endpoint.

Required application resources are `service.name`, `service.version`, and `deployment.environment.name`; Collector enrichment adds pod, namespace, deployment, node, and cluster. HTTP and Redis events use W3C Trace Context. Pino injects active trace and span IDs so Grafana can navigate in both directions between logs and traces.

Metric labels use normalized routes and bounded outcome values. Order IDs never become metric labels. Request bodies, authorization data, cookies, passwords, and tokens are not emitted.

Potentially expensive signals are full log volume, high trace sampling, and histogram dimensions. The local lab initially samples all traces for evidence; a cloud profile must add tail/head sampling and retention appropriate to its measured volume.
