LINT_FILES=server.py app/ tests/ scripts/
TEST_PATH=tests
PYTEST=pytest -k $(TEST_FILTER) $(TEST_PATH) --pythonwarnings=once
PYTEST_COV=--cov=app/ --cov-report=term-missing

VERSION = $(shell git describe --tags --always)
DOCKERHUB_NAMESPACE=test

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
	flask --app server --debug run

worker: ## Start background worker
	watchmedo auto-restart --directory ./ --patterns="*.py" --recursive -- celery -A server.celery_app worker --loglevel=info

database:  ## Creates an empty database
	python scripts/empty_database.py

fixtures: ## Adds initial fixtures to the database
	python scripts/add_fixtures.py

create_admin: ## Create initial admin user (usage: make create_admin EMAIL=admin@example.com PASSWORD=secretpassword)
	flask --app server create-admin --email=$(EMAIL) --password=$(PASSWORD)

migrate: database db_upgrade ## Create database migration
	flask --app server db migrate

db_downgrade: ## Downgrade database
	flask --app server db downgrade

db_upgrade: ## Upgrade database
	flask --app server db upgrade

docker_build_api_latest: ## Build the api docker container and tag it with 'latest'
	docker build -t $(DOCKERHUB_NAMESPACE)/my-solid-app-api:latest -f Dockerfile.api .

docker_build_tasks_latest: ## Build the tasks docker container and tag it with 'latest'
	docker build -t $(DOCKERHUB_NAMESPACE)/my-solid-app-tasks:latest -f Dockerfile.tasks .

docker_build_api_stable: ## Build the api docker container and tag it with the current git version tag and 'stable'
	docker build -t $(DOCKERHUB_NAMESPACE)/my-solid-app-api:$(VERSION) -t $(DOCKERHUB_NAMESPACE)/my-solid-app-api:stable -f Dockerfile.api .

docker_build_tasks_stable: ## Build the tasks docker container and tag it with the current git version tag and 'stable'
	docker build -t $(DOCKERHUB_NAMESPACE)/my-solid-app-tasks:$(VERSION) -t $(DOCKERHUB_NAMESPACE)/my-solid-app-tasks:stable -f Dockerfile.tasks .

docker_push_api_latest: ## Push the api docker container with the tag 'latest'
	docker push $(DOCKERHUB_NAMESPACE)/my-solid-app-api:latest

docker_push_tasks_latest: ## Push the tasks docker container with the tag 'latest'
	docker push $(DOCKERHUB_NAMESPACE)/my-solid-app-tasks:latest

docker_push_api_stable: ## Push the api docker containers with the current git version tag and 'stable'
	docker push $(DOCKERHUB_NAMESPACE)/my-solid-app-api:$(VERSION)
	docker push $(DOCKERHUB_NAMESPACE)/my-solid-app-api:stable

docker_push_tasks_stable: ## Push the tasks docker container with the current git version tag and 'stable'
	docker push $(DOCKERHUB_NAMESPACE)/my-solid-app-tasks:$(VERSION)
	docker push $(DOCKERHUB_NAMESPACE)/my-solid-app-tasks:stable

docker_run_latest: ## Run the api as a docker container
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
