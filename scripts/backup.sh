#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

assert_lab_context
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_dir="${REPO_ROOT}/backups/${timestamp}"
mkdir -p "${backup_dir}"
dump="${backup_dir}/reliability_lab.dump"

kubectl exec -n "${LAB_NAMESPACE}" postgres-0 -- sh -c \
  'pg_dump --username="$POSTGRES_USER" --dbname="$POSTGRES_DB" --format=custom --no-owner --no-acl' >"${dump}"
sha256sum "${dump}" >"${dump}.sha256"
printf '{"classification":"measured","createdAt":"%s","gitSha":"%s","sha256":"%s"}\n' \
  "$(date -u +%FT%TZ)" "$(git -C "${REPO_ROOT}" rev-parse HEAD)" "$(sha256sum "${dump}" | awk '{print $1}')" \
  >"${backup_dir}/metadata.json"
printf '%s\n' "${dump}"
