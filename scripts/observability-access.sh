#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

assert_lab_context
printf 'Grafana: http://localhost:3000 (admin / admin-local-only)\n'
printf 'Prometheus: http://localhost:9090\n'
printf 'Keep this terminal open; press Ctrl-C to stop port forwards.\n'
kubectl --namespace observability port-forward service/observability-grafana 3000:80 >/tmp/sre-lab-grafana-port-forward.log 2>&1 &
grafana_pid=$!
kubectl --namespace observability port-forward service/monitoring-prometheus 9090:9090 >/tmp/sre-lab-prometheus-port-forward.log 2>&1 &
prometheus_pid=$!
trap 'kill ${grafana_pid} ${prometheus_pid} 2>/dev/null || true' EXIT INT TERM
wait
