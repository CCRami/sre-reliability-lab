#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

output_dir="${REPO_ROOT}/observability/prometheus/rules"
mkdir -p "${output_dir}"
rm -f "${output_dir}/slo-generated.yaml"
chmod 777 "${output_dir}"
docker run --rm --network host -v "${REPO_ROOT}:/work" ghcr.io/slok/sloth:v0.16.0 \
  generate --no-color --no-log -i /work/slo/orders.yaml -o /work/observability/prometheus/rules/slo-generated.yaml
if [[ ! -w "${output_dir}/slo-generated.yaml" ]]; then
  sudo chown "$(id -u):$(id -g)" "${output_dir}/slo-generated.yaml"
fi
chmod 755 "${output_dir}"
# Sloth's default catalog is 30d; this lab intentionally uses the agreed 28d portfolio window.
sed -i 's/30d/28d/g' "${output_dir}/slo-generated.yaml"
mkdir -p "${REPO_ROOT}/deploy/helm/observability/files/rules"
cp "${output_dir}/slo-generated.yaml" "${REPO_ROOT}/deploy/helm/observability/files/rules/slo-generated.yaml"
cp "${output_dir}/cause-alerts.yaml" "${REPO_ROOT}/deploy/helm/observability/files/rules/cause-alerts.yaml"
npx prettier --write \
  "${output_dir}/slo-generated.yaml" \
  "${REPO_ROOT}/deploy/helm/observability/files/rules/slo-generated.yaml" >/dev/null
