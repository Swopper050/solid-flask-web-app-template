import os

MY_SOLID_APP_DB_NAME = os.environ.get("MY_SOLID_APP_DB_NAME", "my_solid_app_db")
MY_SOLID_APP_DB_USER = os.environ.get("MY_SOLID_APP_DB_USER", "my_solid_app_user")
MY_SOLID_APP_DB_PASSWORD = os.environ.get(
    "MY_SOLID_APP_DB_PASSWORD", "my_solid_app_password"
)
MY_SOLID_APP_DB_HOST = os.environ.get("MY_SOLID_APP_DB_HOST", "127.0.0.1")
MY_SOLID_APP_DB_PORT = os.environ.get("MY_SOLID_APP_DB_PORT", "3306")


SQLALCHEMY_DATABASE_URL = (
    f"mysql://{MY_SOLID_APP_DB_USER}:{MY_SOLID_APP_DB_PASSWORD}@"
    f"{MY_SOLID_APP_DB_HOST}:{MY_SOLID_APP_DB_PORT}/"
    f"{MY_SOLID_APP_DB_NAME}"
)

MY_SOLID_APP_SECRET_KEY = os.environ.get("MY_SOLID_APP_SECRET_KEY", "secret_oohhhhhh")
