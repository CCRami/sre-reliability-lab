#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

action="${1:-}"
experiment="${2:-}"
ack="I_UNDERSTAND_SRE_LAB_IS_DISPOSABLE"
allowed='^(pod-termination|latency-injection|dependency-failure|resource-pressure|dns-network-degradation|database-queue-saturation)$'

[[ "${action}" == "run" || "${action}" == "delete" ]] || {
  printf 'usage: %s run|delete EXPERIMENT\n' "$0" >&2
  exit 2
}
[[ "${experiment}" =~ ${allowed} ]] || {
  printf 'refusing unknown experiment %q\n' "${experiment}" >&2
  exit 2
}
[[ "${CHAOS_ACK:-}" == "${ack}" ]] || {
  printf 'refusing chaos: set CHAOS_ACK=%s\n' "${ack}" >&2
  exit 1
}
assert_lab_context
kind_bin="$(kind_binary)"
"${kind_bin}" get clusters | grep -Fxq "${LAB_CLUSTER_NAME}" || {
  printf 'refusing chaos: named kind cluster is absent\n' >&2
  exit 1
}
[[ "${LAB_CLUSTER_NAME}" == sre-reliability-lab* ]] || {
  printf 'refusing chaos: cluster name lacks the sre-reliability-lab prefix\n' >&2
  exit 1
}
[[ "$(kubectl get namespace "${LAB_NAMESPACE}" -o jsonpath='{.metadata.labels.sre-lab/disposable}')" == "true" ]] || {
  printf 'refusing chaos: namespace is not labelled sre-lab/disposable=true\n' >&2
  exit 1
}

manifest="${REPO_ROOT}/chaos/experiments/${experiment}.yaml"
if [[ "${CHAOS_DRY_RUN:-false}" == "true" ]]; then
  printf 'guards passed for %s\n' "${experiment}"
  exit 0
fi

if [[ "${action}" == "delete" ]]; then
  kubectl delete --ignore-not-found -f "${manifest}"
  exit 0
fi

kubectl get crd podchaos.chaos-mesh.org >/dev/null 2>&1 || {
  printf 'Chaos Mesh CRDs are absent; run make chaos-install with the same acknowledgement first\n' >&2
  exit 1
}
BASE_URL="${BASE_URL:-http://127.0.0.1:8080}" npm run smoke >/dev/null

cleanup() { kubectl delete --ignore-not-found -f "${manifest}" >/dev/null; }
trap cleanup EXIT INT TERM
kubectl apply -f "${manifest}"

failures=0
deadline=$((SECONDS + ${CHAOS_MAX_SECONDS:-90}))
while ((SECONDS < deadline)); do
  if curl --fail --silent --max-time 2 "${BASE_URL:-http://127.0.0.1:8080}/health/ready" >/dev/null; then
    failures=0
  else
    failures=$((failures + 1))
    if ((failures >= 3)); then
      printf 'abort threshold reached; cleaning up %s\n' "${experiment}" >&2
      exit 1
    fi
  fi
  sleep 5
done
printf 'bounded observation window completed; cleaning up %s\n' "${experiment}"
