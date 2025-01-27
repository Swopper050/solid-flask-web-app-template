CONTAINER_NAME=my-solid-app-mariadb

##@ Utility
help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

docker_up: ## Bring docker services for development up
	docker compose -f docker-compose.dev.yml up -d

docker_down: ## Bring docker services for development down
	docker compose -f docker-compose.dev.yml down

prod_db_backup: ## Makes a backup from the prod database using ssh
	ssh my_solid_app docker exec $(CONTAINER_NAME) mariadb-dump --all-databases -uroot -p$(MYSQL_ROOT_PASSWORD) > ./prod_db_backup.sql

load_prod_db_backup: ## Loads the prod database backup
	docker exec -i my-solid-app-mariadb sh -c 'exec mariadb -uroot -pmy_solid_app_root_password' < ./prod_db_backup.sql
