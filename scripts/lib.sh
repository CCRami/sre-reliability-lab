#!/usr/bin/env bash
set -euo pipefail

LAB_CLUSTER_NAME="sre-reliability-lab"
LAB_CONTEXT="kind-${LAB_CLUSTER_NAME}"
LAB_NAMESPACE="sre-lab"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

kind_binary() {
  if command -v kind >/dev/null 2>&1; then
    command -v kind
  elif [[ -x "${REPO_ROOT}/.tools/bin/kind" ]]; then
    printf '%s\n' "${REPO_ROOT}/.tools/bin/kind"
  else
    printf 'kind is required; run make tools or install kind v0.32.0\n' >&2
    return 1
  fi
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    printf 'required command not found: %s\n' "$1" >&2
    return 1
  }
}

assert_lab_context() {
  local current
  current="$(kubectl config current-context 2>/dev/null || true)"
  [[ "${current}" == "${LAB_CONTEXT}" ]] || {
    printf 'refusing operation: current context %q is not %q\n' "${current}" "${LAB_CONTEXT}" >&2
    return 1
  }
}
