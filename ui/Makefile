LINT_FILES=src/**
DOCKERHUB_NAMESPACE=test
VERSION = $(shell git describe --tags --always)


##@ Utility
help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

deps: ## Install all dependencies
	rm -rf node_modules/
	pnpm install

format: ## Format code with eslint and prettier
	pnpm eslint $(LINT_FILES) --fix --no-warn-ignored
	pnpm prettier --write $(LINT_FILES)

lint: ## Run lint check with eslint, prettier and typescript
	pnpm eslint $(LINT_FILES) --no-warn-ignored
	pnpm prettier --check $(LINT_FILES)
	pnpm tsc

ts_check: ## Run the typescript compiler
	pnpm tsc

ts_watch: ## Run the typescript compiler in watch mode
	pnpm tsc --watch

formatlint: format format_translations lint ## First format code, then run linters

cypress: ## Open cypress for creating and running tests
	pnpm cypress open

server: ## Start the development server
	pnpm run dev

find_unused_translations: ## Finds translation keys in the 'en' locale that are not used in the application
	node scripts/find_unused_translations.js

add_missing_translations: ## Adds missing translation keys to all locales, based on the default 'en' locale
	node scripts/add_missing_translations.js

format_translations:  ## Formats translations in all locales and sorts them alphabetically
	node scripts/format-translations.js
	
check_unused_translations: ## Checks for unused translations and fails if any are found (for CI)
	node scripts/find_unused_translations.js --ci

check_missing_translations: ## Checks for missing translations and fails if any are found (for CI)
	node scripts/add_missing_translations.js --ci

check_format_translations: ## Check if translations are formatted
	node scripts/format-translations.js --check
	
check_translations: check_unused_translations check_missing_translations check_format_translations ## Runs all translation checks for CI

docker_latest: ## Build a docker container and tag it with 'latest'
	docker build -t $(DOCKERHUB_NAMESPACE)/my-solid-app-ui:latest .

docker_stable: ## Build a docker container and tag it with the current git version tag and 'stable'
	docker build -t $(DOCKERHUB_NAMESPACE)/my-solid-app-ui:$(VERSION) -t $(DOCKERHUB_NAMESPACE)/my-solid-app-ui:stable .

docker_push_latest: ## Push the odcker container with the tag 'latest'
	docker push $(DOCKERHUB_NAMESPACE)/my-solid-app-ui:latest

docker_push_stable: ## Push the odcker containers with the current git version tag and 'stable'
	docker push $(DOCKERHUB_NAMESPACE)/my-solid-app-ui:$(VERSION)
	docker push $(DOCKERHUB_NAMESPACE)/my-solid-app-ui:stable

.PHONY: cypress
