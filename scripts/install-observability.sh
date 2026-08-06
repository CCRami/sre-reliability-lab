#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

assert_lab_context
kubectl create namespace observability --dry-run=client -o yaml | kubectl apply -f - >/dev/null
helm dependency build "${REPO_ROOT}/deploy/helm/observability" >/dev/null
helm upgrade --install observability "${REPO_ROOT}/deploy/helm/observability" \
  --namespace observability --wait --timeout 12m

helm upgrade sre-lab "${REPO_ROOT}/deploy/helm/sre-lab" \
  --namespace "${LAB_NAMESPACE}" \
  --set otelEndpoint=http://otel-gateway.observability.svc:4317 \
  --wait --timeout 5m
kubectl rollout status deployment --selector app.kubernetes.io/part-of=sre-reliability-lab \
  --namespace "${LAB_NAMESPACE}" --timeout=180s
printf 'observability ready; run make observability-access in another terminal\n'
