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


MY_SOLID_APP_FERNET_SECRET_KEY = os.environ.get(
    "MY_SOLID_APP_FERNET_SECRET_KEY", "kxmkv6vw7AMDx92BH9JSEZ7_PQqPyYsWZBAGzP0kXys="
)
""" Key used for encrypting. The default key is used for development purposes only. """

MY_SOLID_APP_REDIS_HOST = os.environ.get("MY_SOLID_APP_REDIS_HOST", "localhost")

# MinIO object storage
MY_SOLID_APP_MINIO_HOST = os.environ.get("MY_SOLID_APP_MINIO_HOST", "localhost")
_minio_port_raw = os.environ.get("MY_SOLID_APP_MINIO_PORT", "9000")
MY_SOLID_APP_MINIO_PORT: int | None = int(_minio_port_raw) if _minio_port_raw else None
"""MinIO/S3 port. Leave empty for standard HTTPS (TransIP Object Storage, etc.)."""
MY_SOLID_APP_MINIO_USER = os.environ.get("MY_SOLID_APP_MINIO_USER", "minioadmin")
MY_SOLID_APP_MINIO_PASSWORD = os.environ.get("MY_SOLID_APP_MINIO_PASSWORD", "minioadmin")
MY_SOLID_APP_MINIO_BUCKET = os.environ.get(
    "MY_SOLID_APP_MINIO_BUCKET", "my-solid-app-dev"
)
MY_SOLID_APP_MINIO_SECURE = (
    os.environ.get("MY_SOLID_APP_MINIO_SECURE", "False") == "True"
)
"""Whether to use HTTPS for MinIO connections. Set to True in production."""
MY_SOLID_APP_MINIO_REGION = os.environ.get("MY_SOLID_APP_MINIO_REGION", "EU")

MY_SOLID_APP_STORAGE_MAX_FILE_BYTES = int(
    os.environ.get("MY_SOLID_APP_STORAGE_MAX_FILE_BYTES", str(200 * 1024 * 1024))
)
"""Maximum upload size per file in bytes. Defaults to 200 MB."""

MY_SOLID_APP_STORAGE_DEFAULT_QUOTA_BYTES = int(
    os.environ.get(
        "MY_SOLID_APP_STORAGE_DEFAULT_QUOTA_BYTES", str(10 * 1024 * 1024 * 1024)
    )
)
"""Default storage quota per workspace in bytes. Defaults to 10 GB."""

MY_SOLID_APP_MOLLIE_API_KEY = os.environ.get("MY_SOLID_APP_MOLLIE_API_KEY", "test_xxxxx")
MY_SOLID_APP_API_URL = os.environ.get("MY_SOLID_APP_API_URL", "http://localhost:5000")


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
    MAIL_USE_SSL = os.environ.get("MY_SOLID_APP_MAIL_USE_SSL") == "True"
    MAIL_USERNAME = os.environ.get("MY_SOLID_APP_MAIL_USERNAME", "mysolidapp@mail.com")
    MAIL_PASSWORD = os.environ.get("MY_SOLID_APP_MAIL_PASSWORD", "12345678")
    MAIL_DEFAULT_SENDER = os.environ.get(
        "MY_SOLID_APP_MAIL_DEFAULT_SENDER", "mysolidapp@mail.com"
    )
    FILE_LOGGING = os.environ.get("MY_SOLID_APP_FILE_LOGGING", "False") == "True"

    # MinIO
    MINIO_HOST = MY_SOLID_APP_MINIO_HOST
    MINIO_PORT = MY_SOLID_APP_MINIO_PORT
    MINIO_USER = MY_SOLID_APP_MINIO_USER
    MINIO_PASSWORD = MY_SOLID_APP_MINIO_PASSWORD
    MINIO_BUCKET = MY_SOLID_APP_MINIO_BUCKET
    MINIO_SECURE = MY_SOLID_APP_MINIO_SECURE
    MINIO_REGION = MY_SOLID_APP_MINIO_REGION
    STORAGE_MAX_FILE_BYTES = MY_SOLID_APP_STORAGE_MAX_FILE_BYTES
    STORAGE_DEFAULT_QUOTA_BYTES = MY_SOLID_APP_STORAGE_DEFAULT_QUOTA_BYTES

    CELERY = {
        "broker_url": f"redis://{MY_SOLID_APP_REDIS_HOST}",
        "result_backend": f"redis://{MY_SOLID_APP_REDIS_HOST}",
        "task_ignore_result": True,
    }


class ProdConfig(BaseConfig):
    ENV = "prod"
    DEBUG = False
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True


class DevConfig(BaseConfig):
    ENV = "dev"
    DEBUG = True


class TestConfig(BaseConfig):
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite://"
