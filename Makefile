##@ Utility
help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

docker_up: ## Bring docker services for development up
	docker compose -f docker-compose.dev.yml up -d

docker_down: ## Bring docker services for development down
	docker compose -f docker-compose.dev.yml down

load_prod_db_backup: ## Loads the prod database backup
	docker exec -i my-solid-app-mariadb mariadb -uroot -pmy_solid_app_root_password -e "DROP DATABASE IF EXISTS my_solid_app_db;"
	docker exec -i my-solid-app-mariadb mariadb -uroot -pmy_solid_app_root_password -e "CREATE DATABASE my_solid_app_db;"
	docker exec -i my-solid-app-mariadb mariadb -uroot -pmy-solid-app_root_password my_solid_app_db < ./prod_db_backup.sql
	docker exec -i my-solid-app-mariadb mariadb -u root -pmy_solid_app_root_password -e "DROP USER IF EXISTS 'my_solid_app_user'@'%';"
	docker exec -i my-solid-app-mariadb mariadb -u root -pmy_solid_app_root_password -e "DROP USER IF EXISTS 'my_solid_app'@'%';"
	docker exec -i my-solid-app-mariadb mariadb -u root -pmy_solid_app_root_password -e "CREATE USER 'my_solid_app_user'@'%' IDENTIFIED BY 'my_solid_app_password';"
	docker exec -i my-solid-app-mariadb mariadb -u root -pmy_solid_app_root_password -e "GRANT ALL PRIVILEGES ON my_solid_app_db.* TO 'my_solid_app_user'@'%';"
	docker exec -i my-solid-app-mariadb mariadb -u root -pmy_solid_app_root_password -e "FLUSH PRIVILEGES;"

load_staging_db_backup: ## Loads the staging database backup
	docker exec -i my-solid-app-mariadb mariadb -uroot -pmy_solid_app_root_password -e "DROP DATABASE IF EXISTS my_solid_app_db;"
	docker exec -i my-solid-app-mariadb mariadb -uroot -pmy_solid_app_root_password -e "CREATE DATABASE my_solid_app_db;"
	docker exec -i my-solid-app-mariadb mariadb -uroot -pmy_solid_app_root_password my_solid_app_db < ./staging_db_backup.sql
	docker exec -i my-solid-app-mariadb mariadb -u root -pmy_solid_app_root_password -e "DROP USER IF EXISTS 'my_solid_app_user'@'%';"
	docker exec -i my-solid-app-mariadb mariadb -u root -pmy_solid_app_root_password -e "DROP USER IF EXISTS 'my_solid_app_staging'@'%';"
	docker exec -i my-solid-app-mariadb mariadb -u root -pmy_solid_app_root_password -e "CREATE USER 'my_solid_app_user'@'%' IDENTIFIED BY 'my_solid_app_password';"
	docker exec -i my-solid-app-mariadb mariadb -u root -pmy_solid_app_root_password -e "GRANT ALL PRIVILEGES ON my_solid_app_db.* TO 'my_solid_app_user'@'%';"
	docker exec -i my-solid-app-mariadb mariadb -u root -pmy_solid_app_root_password -e "FLUSH PRIVILEGES;"

test_migration_prod: load_prod_db_backup ## Tests the migration on the prod database backup
	cd api && source .env/bin/activate && make db_upgrade

test_migration_staging: load_staging_db_backup ## Tests the migration on the staging database backup
	cd api && source .env/bin/activate && make db_upgrade

lines_ui:  ## Total lines of code in the UI
	@find ui -type f \( -name "*.ts" -o -name "*.tsx" \) \
		! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/.pnpm/*" ! -name ".env*" \
		-exec wc -l {} + | awk 'END { print $$1 "  ui" }'

lines_api:  ## Total lines of code in the API
	@find api -type f -name "*.py" \
		! -path "*/__pycache__/*" \
		! -path "*/.env/*" ! -path "*/.venv/*" ! -path "*/venv/*" \
		! -path "*/migrations/*" ! -path "*/tests/*" \
		-exec wc -l {} + | awk 'END { print $$1 "  api" }'


lines: lines_ui lines_api  ## Count lines of code in the project
