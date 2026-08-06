SHELL := /usr/bin/env bash
.DEFAULT_GOAL := help

.PHONY: help install check compose-up compose-down smoke tools preflight images bootstrap teardown helm-validate
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
