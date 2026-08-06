#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fake_bin="$(mktemp -d)"
trap 'rm -rf "${fake_bin}"' EXIT

cat >"${fake_bin}/kubectl" <<'EOF'
#!/usr/bin/env bash
if [[ "$*" == "config current-context" ]]; then printf '%s\n' "${FAKE_CONTEXT:-wrong}"; exit 0; fi
if [[ "$*" == *"get namespace sre-lab"* ]]; then printf '%s' "${FAKE_DISPOSABLE:-false}"; exit 0; fi
exit 0
EOF
cat >"${fake_bin}/kind" <<'EOF'
#!/usr/bin/env bash
if [[ "$*" == "get clusters" ]]; then printf '%s\n' "${FAKE_CLUSTER:-other}"; fi
EOF
chmod +x "${fake_bin}/kubectl" "${fake_bin}/kind"

run_guard() {
  PATH="${fake_bin}:${PATH}" CHAOS_DRY_RUN=true \
    "${repo_root}/scripts/chaos.sh" run pod-termination >/dev/null 2>&1
}

if run_guard; then printf 'FAIL: missing acknowledgement was accepted\n' >&2; exit 1; fi
if CHAOS_ACK=I_UNDERSTAND_SRE_LAB_IS_DISPOSABLE run_guard; then
  printf 'FAIL: wrong context was accepted\n' >&2; exit 1
fi
if CHAOS_ACK=I_UNDERSTAND_SRE_LAB_IS_DISPOSABLE FAKE_CONTEXT=kind-sre-reliability-lab run_guard; then
  printf 'FAIL: missing cluster was accepted\n' >&2; exit 1
fi
if CHAOS_ACK=I_UNDERSTAND_SRE_LAB_IS_DISPOSABLE FAKE_CONTEXT=kind-sre-reliability-lab \
  FAKE_CLUSTER=sre-reliability-lab run_guard; then
  printf 'FAIL: missing disposable label was accepted\n' >&2; exit 1
fi
CHAOS_ACK=I_UNDERSTAND_SRE_LAB_IS_DISPOSABLE FAKE_CONTEXT=kind-sre-reliability-lab \
  FAKE_CLUSTER=sre-reliability-lab FAKE_DISPOSABLE=true run_guard
printf 'chaos guard tests passed\n'
