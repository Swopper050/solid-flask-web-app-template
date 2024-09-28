LINT_FILES=src/**


help:
	$(call echotask,"deps","Removes and installs all dependencies.")
	$(call echotask,"format","Runs eslint and prettier.")
	$(call echotask,"lint","Runs eslint and prettier in check only mode.")
	$(call echotask,"formatlint","Formats the code and then lints it.")

deps:
	rm -rf node_modules/
	npm install

format:
	npx eslint $(LINT_FILES) --fix
	npx prettier --write $(LINT_FILES)

lint: ## Run various linters.
	npx eslint $(LINT_FILES)
	npx prettier --check $(LINT_FILES)

formatlint: format lint
