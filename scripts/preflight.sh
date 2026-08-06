#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

require_command docker
require_command kubectl
require_command helm
require_command npm
kind_bin="$(kind_binary)"

docker info >/dev/null
kubectl version --client >/dev/null
helm version --short
"${kind_bin}" version
printf 'preflight passed for cluster %s\n' "${LAB_CLUSTER_NAME}"
