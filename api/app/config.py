import os

DB_NAME = os.environ.get("DB_NAME", "myapp_db")
DB_USER = os.environ.get("DB_USER", "myapp_user")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "myapp_password")
DB_HOST = os.environ.get("DB_HOST", "127.0.0.1")
DB_PORT = os.environ.get("DB_PORT", "3306")


SQLALCHEMY_DATABASE_URL = (
    f"mysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

MYAPP_SECRET_KEY = os.environ.get("MYAPP_SECRET_KEY", "secret_oohhhhhh")

MYAPP_JWT_SECRET_KEY = os.environ.get("MYAPP_JWT_SECRET_KEY", "pssst_jwt_secret")

MYAPP_MINIO_URL = os.environ.get("MYAPP_MINIO_URL", "localhost:9000")
MYAPP_MINIO_USER = os.environ.get("MYAPP_MINIO_USER", "minio_access_key")
MYAPP_MINIO_PASSWORD = os.environ.get("MYAPP_MINIO_PASSWORD", "minio_secret_key")
MYAPP_MINIO_BUCKET = os.environ.get("MYAPP_MINIO_BUCKET", "myapp")
