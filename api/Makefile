LINT_FILES=server.py app/ tests/ scripts/
TEST_PATH=tests
PYTEST=pytest $(TEST_PATH) --pythonwarnings=once
VERSION = $(shell git describe --tags --always)

DOCKERHUB_NAMESPACE=test

DB_ROOT_PASSWORD=my_solid_app_db_root_password
DB_USER=my_solid_app_user
DB_PASSWORD=my_solid_app_password
DB_NAME=my_solid_app_db
DB_HOST=127.0.0.1
DB_PORT=3306
DB_URL=mysql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)

DEV_ENV=MY_SOLID_APP_DB_NAME=$(DB_NAME) \
  MY_SOLID_APP_DB_USER=$(DB_USER) \
  MY_SOLID_APP_DB_PASSWORD=$(DB_PASSWORD) \
  MY_SOLID_APP_DB_HOST=$(DB_HOST) \
  MY_SOLID_APP_DB_PORT=$(DB_PORT)


##@ Utility
help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)


pip: ## Update pip
	pip install --upgrade pip

deps_dev: pip ## Install development dependencies 
	pip install -r requirements_dev.txt

deps_prod: pip ## Install production dependencies
	pip install -r requirements.txt
	pip install -e .

deps: deps_prod deps_dev ## Install all dependencies

format: ## Format code with black and isort
	isort --filter-files $(LINT_FILES)
	black $(LINT_FILES)

format_check: ## Check code with black and isort
	isort --check-only --filter-files $(LINT_FILES)
	black --check $(LINT_FILES)

flake8: ## Run flake8 lint check
	flake8 $(LINT_FILES)

lint: format_check flake8 ## Run isort, black and flake8

formatlint: format lint ## Format code first, then run linters

test: ## Run tests
	$(PYTEST)

server: ## Start development server
	$(DEV_ENV) flask --app server --debug run

fixtures: db_upgrade ## Adds initial fixtures to the database
	python scripts/add_fixtures.py

migrate: ## Create database migration
	flask --app server db migrate

db_downgrade: ## Downgrade database
	flask --app server db downgrade

db_upgrade: ## Upgrade database
	flask --app server db upgrade

docker_latest: ## Build a docker container and tag it with the current git version tag and 'latest'
	docker build -t $(DOCKERHUB_NAMESPACE)/my-solid-app-api:$(VERSION) -t $(DOCKERHUB_NAMESPACE)/my-solid-app-api:latest .

docker_push: ## Push the docker containers with the current git version tag and 'latest'
	docker push $(DOCKERHUB_NAMESPACE)/my-solid-app-api:$(VERSION)
	docker push $(DOCKERHUB_NAMESPACE)/my-solid-app-api:latest

docker_run: ## Run the api as a docker container
	docker run \
		--name my-solid-app-api \
		--network host \
		-e MY_SOLID_APP_DB_NAME=$(DB_NAME) \
		-e MY_SOLID_APP_DB_USER=$(DB_USER) \
		-e MY_SOLID_APP_DB_PASSWORD=$(DB_PASSWORD) \
		-e MY_SOLID_APP_DB_HOST=$(DB_HOST) \
		-e MY_SOLID_APP_DB_PORT=$(DB_PORT) \
		-d \
		$(DOCKERHUB_NAMESPACE)/my-solid-app-api:latest
