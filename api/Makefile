LINT_FILES=server.py app/ tests/ scripts/
TEST_PATH=tests
PYTEST=pytest $(TEST_PATH) --pythonwarnings=once

DB_ROOT_PASSWORD=myapp_root_password
DB_USER=myapp_user
DB_PASSWORD=myapp_password
DB_NAME=myapp_db
DB_HOST=127.0.0.1
DB_PORT=3306
DB_URL=mysql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)

DEV_ENV=DB_NAME=$(DB_NAME) DB_USER=$(DB_USER) DB_PASSWORD=$(DB_PASSWORD) DB_HOST=$(DB_HOST) DB_PORT=$(DB_PORT)


help:
	$(call echotask,"pip","Updates pip.")
	$(call echotask,"deps_dev","Installs development dependencies.")
	$(call echotask,"deps_prod","Installs application dependencies.")
	$(call echotask,"deps","Installs dev and application dependencies.")
	$(call echotask,"format","Runs black, isort and flake8.")
	$(call echotask,"format_check","Runs black, isort in check only mode.")
	$(call echotask,"flake8","Runs flake8.")
	$(call echotask,"lint","Runs black, isort and flake8 in check only mode.")
	$(call echotask,"formatlint","Formats the code and then lints it.")
	$(call echotask,"test","Runs all tests.")
	$(call echotask,"server","Runs the API.")

pip:
	pip install --upgrade pip

deps_dev: pip
	pip install -r requirements_dev.txt

deps_prod: pip
	pip install -e .

deps: deps_prod deps_dev

format:
	isort --filter-files $(LINT_FILES)
	black $(LINT_FILES)

format_check:
	isort --check-only --filter-files $(LINT_FILES)
	black --check $(LINT_FILES)

flake8:
	flake8 $(LINT_FILES)

lint: format_check flake8

formatlint: format lint

test:
	$(PYTEST)

server:
	$(DEV_ENV) python server.py 

database:
	CONTAINER_NAME=solid-flask-web-app-template-db-1 ROOT_PASSWORD=$(DB_ROOT_PASSWORD) DB_NAME=$(DB_NAME) DB_USER=$(DB_USER) DB_PASSWORD=$(DB_PASSWORD) ./scripts/create_database.sh
	python scripts/add_fixtures.py
