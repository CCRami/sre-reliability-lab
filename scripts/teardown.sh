#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

kind_bin="$(kind_binary)"
if ! "${kind_bin}" get clusters | grep -Fxq "${LAB_CLUSTER_NAME}"; then
  printf 'cluster %s does not exist; nothing to delete\n' "${LAB_CLUSTER_NAME}"
  exit 0
fi

current="$(kubectl config current-context 2>/dev/null || true)"
if [[ "${current}" != "${LAB_CONTEXT}" ]]; then
  printf 'refusing teardown: switch to %s before deleting the lab\n' "${LAB_CONTEXT}" >&2
  exit 1
fi
"${kind_bin}" delete cluster --name "${LAB_CLUSTER_NAME}"
