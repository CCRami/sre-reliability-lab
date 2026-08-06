SHELL := /usr/bin/env bash
.DEFAULT_GOAL := help

.PHONY: help install check compose-up compose-down smoke
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
