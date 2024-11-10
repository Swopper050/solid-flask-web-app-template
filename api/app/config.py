import os

MY_SOLID_APP_DB_NAME = os.environ.get("MY_SOLID_APP_DB_NAME", "my_solid_app_db")
MY_SOLID_APP_DB_USER = os.environ.get("MY_SOLID_APP_DB_USER", "my_solid_app_user")
MY_SOLID_APP_DB_PASSWORD = os.environ.get(
    "MY_SOLID_APP_DB_PASSWORD", "my_solid_app_password"
)
MY_SOLID_APP_DB_HOST = os.environ.get("MY_SOLID_APP_DB_HOST", "127.0.0.1")
MY_SOLID_APP_DB_PORT = os.environ.get("MY_SOLID_APP_DB_PORT", "3306")

MY_SOLID_APP_PASSWORD_RESET_TOKEN_EXPIRE_HOURS = int(
    os.environ.get("MY_SOLID_APP_PASSWORD_RESET_TOKEN_EXPIRE_HOURS", "1")
)
MY_SOLID_APP_FRONTEND_URL = os.environ.get(
    "MY_SOLID_APP_FRONTEND_URL", "http://localhost:5173"
)


class BaseConfig:
    SECRET_KEY = os.environ.get("MY_SOLID_APP_SECRET_KEY", "secret_oohhhhhh")
    SQLALCHEMY_DATABASE_URI = (
        f"mysql://{MY_SOLID_APP_DB_USER}:{MY_SOLID_APP_DB_PASSWORD}@"
        f"{MY_SOLID_APP_DB_HOST}:{MY_SOLID_APP_DB_PORT}/"
        f"{MY_SOLID_APP_DB_NAME}"
    )

    MAIL_SERVER = os.environ.get("MY_SOLID_APP_MAIL_SERVER", "localhost")
    MAIL_PORT = int(os.environ.get("MY_SOLID_APP_MAIL_PORT", 1025))
    MAIL_USE_TLS = False
    MAIL_USE_SSL = os.enriron.get("MY_SOLID_APP_MAIL_USE_SSL") == "True"
    MAIL_USERNAME = os.environ.get("MY_SOLID_APP_MAIL_USERNAME", "mysolidapp@mail.com")
    MAIL_PASSWORD = os.environ.get("MY_SOLID_APP_MAIL_PASSWORD", "12345678")
    MAIL_DEFAULT_SENDER = os.environ.get(
        "MY_SOLID_APP_MAIL_DEFAULT_SENDER", "mysolidapp@mail.com"
    )


class ProdConfig(BaseConfig):
    ENV = "prod"
    DEBUG = False


class DevConfig(BaseConfig):
    ENV = "dev"
    DEBUG = True


class TestConfig(BaseConfig):
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite://"
