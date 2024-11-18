from cryptography.fernet import Fernet

from app.config import MY_SOLID_APP_FERNET_SECRET_KEY

fernet = Fernet(MY_SOLID_APP_FERNET_SECRET_KEY)


def encrypt(value: str):
    return fernet.encrypt(value.encode()).decode()


def decrypt(value: str):
    return fernet.decrypt(value.encode()).decode()
