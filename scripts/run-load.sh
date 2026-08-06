#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

profile="${1:-smoke}"
case "${profile}" in smoke | baseline | stress | spike | soak) ;; *)
  printf 'unknown profile %q; use smoke, baseline, stress, spike, or soak\n' "${profile}" >&2
  exit 2
esac

docker_network_args=(--add-host=host.docker.internal:host-gateway)
default_base_url="http://host.docker.internal:8080"
if ! docker network inspect bridge >/dev/null 2>&1; then
  docker_network_args=(--network host)
  default_base_url="http://127.0.0.1:8080"
fi
base_url="${BASE_URL:-${default_base_url}}"
run_id="$(date -u +%Y%m%dT%H%M%SZ)-${profile}"
raw_dir="${REPO_ROOT}/reports/raw/${run_id}"
mkdir -p "${raw_dir}"

git_sha="$(git -C "${REPO_ROOT}" rev-parse HEAD)"
node_name="$(kubectl get nodes -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || printf unknown)"
cat >"${raw_dir}/metadata.json" <<EOF
{"classification":"measured","profile":"${profile}","gitSha":"${git_sha}","startedAt":"$(date -u +%FT%TZ)","baseUrl":"${base_url}","node":"${node_name}","rate":"${RATE:-profile-default}","duration":"${DURATION:-profile-default}"}
EOF
chmod 777 "${raw_dir}"

docker run --rm "${docker_network_args[@]}" \
  -e BASE_URL="${base_url}" -e RATE="${RATE:-}" -e DURATION="${DURATION:-}" \
  -v "${REPO_ROOT}/tests/load/k6:/scripts:ro" -v "${raw_dir}:/results" \
  grafana/k6:1.6.1 run --summary-export=/results/summary.json "/scripts/${profile}.js"
[[ -s "${raw_dir}/summary.json" ]] || { printf 'k6 summary export is missing\n' >&2; exit 1; }
chmod 755 "${raw_dir}"

printf 'raw measured result: %s\n' "${raw_dir}"
