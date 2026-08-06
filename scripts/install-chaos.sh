#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

assert_lab_context
[[ "${CHAOS_ACK:-}" == "I_UNDERSTAND_SRE_LAB_IS_DISPOSABLE" ]] || {
  printf 'refusing Chaos Mesh install: set CHAOS_ACK=I_UNDERSTAND_SRE_LAB_IS_DISPOSABLE\n' >&2
  exit 1
}
[[ "$(kubectl get namespace "${LAB_NAMESPACE}" -o jsonpath='{.metadata.labels.sre-lab/disposable}')" == "true" ]] || {
  printf 'refusing Chaos Mesh install: namespace is not labelled disposable\n' >&2
  exit 1
}

# The controller opens one informer per experiment CRD. kind inherits a low inotify-instance
# ceiling on some Docker hosts, so raise it only inside this explicitly validated disposable node.
docker exec "${LAB_CLUSTER_NAME}-control-plane" sysctl -w fs.inotify.max_user_instances=1024 >/dev/null

helm repo add chaos-mesh https://charts.chaos-mesh.org --force-update >/dev/null
helm upgrade --install chaos-mesh chaos-mesh/chaos-mesh --version 2.8.3 \
  --namespace chaos-mesh --create-namespace \
  --values "${REPO_ROOT}/deploy/chaos-mesh/values.yaml" --wait --timeout 10m
kubectl annotate namespace "${LAB_NAMESPACE}" chaos-mesh.org/inject=enabled --overwrite
printf 'Chaos Mesh installed but no experiment has been started.\n'
