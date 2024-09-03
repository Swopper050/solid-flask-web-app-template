import app.config as config
from minio import Minio

minio_client = Minio(
    config.MYAPP_MINIO_URL,
    access_key=config.MYAPP_MINIO_USER,
    secret_key=config.MYAPP_MINIO_PASSWORD,
    secure=False,
)
