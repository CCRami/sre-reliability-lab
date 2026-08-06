#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DIR="${REPO_ROOT}/.tools/bin"
KIND_VERSION="v0.32.0"

mkdir -p "${TOOLS_DIR}"
if [[ ! -x "${TOOLS_DIR}/kind" ]]; then
  platform="$(uname -s | tr '[:upper:]' '[:lower:]')"
  arch="$(uname -m)"
  [[ "${arch}" == "x86_64" ]] && arch="amd64"
  [[ "${arch}" == "aarch64" ]] && arch="arm64"
  url="https://github.com/kubernetes-sigs/kind/releases/download/${KIND_VERSION}/kind-${platform}-${arch}"
  curl --fail --location --output "${TOOLS_DIR}/kind" "${url}"
  curl --fail --location --output "${TOOLS_DIR}/kind.sha256sum" "${url}.sha256sum"
  expected="$(awk '{print $1}' "${TOOLS_DIR}/kind.sha256sum")"
  actual="$(sha256sum "${TOOLS_DIR}/kind" | awk '{print $1}')"
  [[ "${actual}" == "${expected}" ]] || {
    printf 'kind checksum verification failed\n' >&2
    exit 1
  }
  chmod +x "${TOOLS_DIR}/kind"
fi
"${TOOLS_DIR}/kind" version
