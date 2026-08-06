#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

"${REPO_ROOT}/scripts/preflight.sh"
kind_bin="$(kind_binary)"

if ! "${kind_bin}" get clusters | grep -Fxq "${LAB_CLUSTER_NAME}"; then
  "${kind_bin}" create cluster --config "${REPO_ROOT}/deploy/kind/cluster.yaml" --wait 120s
fi
kubectl config use-context "${LAB_CONTEXT}" >/dev/null
assert_lab_context

kubectl create namespace "${LAB_NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f - >/dev/null
kubectl label namespace "${LAB_NAMESPACE}" sre-lab/disposable=true --overwrite >/dev/null

"${REPO_ROOT}/scripts/build-images.sh"
for service in gateway catalog orders worker; do
  "${kind_bin}" load docker-image --name "${LAB_CLUSTER_NAME}" "sre-lab/${service}:${IMAGE_TAG:-dev}"
done
for dependency_image in sre-lab/postgres:17.6 sre-lab/redis:8.2; do
  "${kind_bin}" load docker-image --name "${LAB_CLUSTER_NAME}" "${dependency_image}"
done

helm upgrade --install sre-lab "${REPO_ROOT}/deploy/helm/sre-lab" \
  --namespace "${LAB_NAMESPACE}" --wait --timeout 5m
kubectl wait --namespace "${LAB_NAMESPACE}" --for=condition=Available deployment --all --timeout=180s

if [[ "${OBSERVABILITY_ENABLED:-true}" == "true" ]]; then
  "${REPO_ROOT}/scripts/install-observability.sh"
fi

BASE_URL="http://localhost:8080" npm run smoke
printf 'lab ready: http://localhost:8080\n'
