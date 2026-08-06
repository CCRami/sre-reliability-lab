#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

assert_lab_context
dump="${1:-}"
[[ -f "${dump}" ]] || { printf 'usage: %s /exact/path/to/reliability_lab.dump\n' "$0" >&2; exit 2; }
sha_file="${dump}.sha256"
[[ ! -f "${sha_file}" ]] || sha256sum --check "${sha_file}"

started_epoch="$(date +%s)"
started_at="$(date -u +%FT%TZ)"
kubectl apply -f "${REPO_ROOT}/deploy/recovery/restore-target.yaml" >/dev/null
kubectl delete pod postgres-restore-0 -n "${LAB_NAMESPACE}" --ignore-not-found --wait=false >/dev/null
kubectl rollout status statefulset/postgres-restore -n "${LAB_NAMESPACE}" --timeout=180s
kubectl cp "${dump}" "${LAB_NAMESPACE}/postgres-restore-0:/tmp/reliability_lab.dump" -c postgres
kubectl exec -n "${LAB_NAMESPACE}" postgres-restore-0 -- sh -c \
  'dropdb --username="$POSTGRES_USER" --if-exists reliability_restore && createdb --username="$POSTGRES_USER" reliability_restore'
kubectl exec -n "${LAB_NAMESPACE}" postgres-restore-0 -- sh -c \
  'pg_restore --username="$POSTGRES_USER" --dbname=reliability_restore --clean --if-exists --no-owner --no-acl /tmp/reliability_lab.dump'

db_user="$(kubectl get secret sre-lab-database -n "${LAB_NAMESPACE}" -o jsonpath='{.data.username}' | base64 --decode)"
verification="$(kubectl exec -n "${LAB_NAMESPACE}" postgres-restore-0 -- \
  psql --username="${db_user}" --dbname=reliability_restore --tuples-only --no-align --field-separator=, \
  --command="SELECT (SELECT count(*) FROM products), (SELECT count(*) FROM orders), (SELECT md5(coalesce(string_agg(id::text || name || price_cents::text, '|' ORDER BY id), '')) FROM products), (SELECT md5(coalesce(string_agg(id::text || status || quantity::text, '|' ORDER BY id), '')) FROM orders);")"
ended_epoch="$(date +%s)"
report_dir="${REPO_ROOT}/reports/raw/restore-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "${report_dir}"
IFS=, read -r products orders product_checksum order_checksum <<<"${verification}"
printf '{"classification":"measured","startedAt":"%s","rtoSeconds":%d,"rpo":"snapshot time of supplied dump","products":%s,"orders":%s,"productChecksum":"%s","orderChecksum":"%s","gitSha":"%s"}\n' \
  "${started_at}" "$((ended_epoch - started_epoch))" "${products}" "${orders}" "${product_checksum}" "${order_checksum}" \
  "$(git -C "${REPO_ROOT}" rev-parse HEAD)" >"${report_dir}/result.json"
printf 'isolated restore verified: %s\n' "${report_dir}/result.json"
