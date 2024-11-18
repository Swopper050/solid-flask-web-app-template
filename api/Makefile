LINT_FILES=server.py app/ tests/ scripts/
TEST_PATH=tests
PYTEST=pytest -k $(TEST_FILTER) $(TEST_PATH) --pythonwarnings=once
PYTEST_COV=--cov=app/ --cov-report=term-missing

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

format: ## Format code ruff 
	ruff format  $(LINT_FILES)

format_check: ## Check code format with ruff 
	ruff format --check $(LINT_FILES)

ruff_fix: ## Run ruff lint check with auto fix
	ruff check --fix $(LINT_FILES)

ruff: ## Run ruff lint check
	ruff check $(LINT_FILES)

lint: format_check ruff  ## Run ruff format and ruff lint 

formatlint: ruff_fix format lint $(LINT_FILES) ## Format code first, then run linters

test: ## Run tests
	$(PYTEST)

test_cov: ## Run tests and show coverage
	$(PYTEST) $(PYTEST_COV)

server: ## Start development server
	$(DEV_ENV) flask --app server --debug run

database:  ## Creates an empty database
	python scripts/empty_database.py

fixtures: ## Adds initial fixtures to the database
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
