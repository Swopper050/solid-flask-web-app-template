import os

MY_SOLID_APP_DB_NAME = os.environ.get("MY_SOLID_APP_DB_NAME", "my_solid_app_db")
MY_SOLID_APP_DB_USER = os.environ.get("MY_SOLID_APP_DB_USER", "my_solid_app_user")
MY_SOLID_APP_DB_PASSWORD = os.environ.get(
    "MY_SOLID_APP_DB_PASSWORD", "my_solid_app_password"
)
MY_SOLID_APP_DB_HOST = os.environ.get("MY_SOLID_APP_DB_HOST", "127.0.0.1")
MY_SOLID_APP_DB_PORT = os.environ.get("MY_SOLID_APP_DB_PORT", "3306")

MY_SOLID_APP_SMTP_HOST = os.environ.get("MY_SOLID_APP_SMTP_HOST", "smtp.server.com")
MY_SOLID_APP_SMTP_PORT = int(os.environ.get("MY_SOLID_APP_SMTP_PORT", 465))
MY_SOLID_APP_EMAIL_SENDER = os.environ.get(
    "MY_SOLID_APP_EMAIL_SENDER", "mysolidapp@mail.com"
)
MY_SOLID_APP_EMAIL_PASSWORD = os.environ.get(
    "MY_SOLID_APP_EMAIL_PASSWORD", "stmp_password"
)
MY_SOLID_APP_EMAIL_RESET_TOKEN_EXPIRE_HOURS = int(
    os.environ.get("MY_SOLID_APP_EMAIL_RESET_TOKEN_EXPIRE_HOURS", "1")
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
