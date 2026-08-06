#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

tag="${IMAGE_TAG:-dev}"
build_command=(build)
if ! docker network inspect bridge >/dev/null 2>&1; then
  if ! docker buildx inspect sre-lab-builder >/dev/null 2>&1; then
    docker buildx create --name sre-lab-builder --driver docker-container --driver-opt network=host >/dev/null
  fi
  build_command=(buildx build --builder sre-lab-builder --load)
fi
docker "${build_command[@]}" --quiet --tag sre-lab/postgres:17.6 "${REPO_ROOT}/deploy/images/postgres"
docker "${build_command[@]}" --quiet --tag sre-lab/redis:8.2 "${REPO_ROOT}/deploy/images/redis"
for service in gateway catalog orders worker; do
  docker "${build_command[@]}" --quiet --build-arg "SERVICE=${service}" --tag "sre-lab/${service}:${tag}" "${REPO_ROOT}"
done
