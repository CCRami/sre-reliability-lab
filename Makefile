SHELL := /usr/bin/env bash
.DEFAULT_GOAL := help

.PHONY: help install check compose-up compose-down smoke tools preflight images bootstrap teardown helm-validate observability observability-access slo-generate promtool-test
help:
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z0-9_-]+:.*## / {printf "%-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install locked Node dependencies
	npm ci

check: ## Run formatting, lint, type, and unit checks
	npm run check

compose-up: ## Start the application foundation locally
	docker compose up --build -d --wait

compose-down: ## Stop the application foundation
	docker compose down

smoke: ## Exercise the critical order journey
	npm run smoke

tools: ## Install pinned local development tools under .tools
	./scripts/install-tools.sh

preflight: ## Validate local Kubernetes prerequisites
	./scripts/preflight.sh

images: ## Build the four application images
	./scripts/build-images.sh

bootstrap: ## Create and validate the disposable kind lab
	./scripts/bootstrap.sh

teardown: ## Delete only the named disposable kind cluster
	./scripts/teardown.sh

helm-validate: ## Lint and render the application Helm chart
	helm lint deploy/helm/sre-lab
	helm template sre-lab deploy/helm/sre-lab >/dev/null
	helm dependency build deploy/helm/observability
	helm lint deploy/helm/observability
	helm template observability deploy/helm/observability --namespace observability >/dev/null

observability: ## Install or update metrics, logs, traces, dashboards, and alerts
	./scripts/install-observability.sh

observability-access: ## Port-forward Grafana and Prometheus
	./scripts/observability-access.sh

slo-generate: ## Regenerate Prometheus SLO rules from the Sloth specification
	./scripts/generate-slos.sh

promtool-test: ## Run alert and recording-rule unit tests
	docker run --rm --network host --entrypoint=/bin/promtool -v "$(CURDIR)/observability/prometheus/rules:/rules:ro" prom/prometheus:v3.9.1 test rules /rules/tests.yaml
