from setuptools import setup, find_packages


setup(
    name="react-flask-web-app-template",
    version="0.1",
    author="Bram de Wit",
    packages=find_packages(),
    install_requires=[
        "flask==3.0.3",
        "flask-jwt-extended==4.6.0",
        "flask-restx==1.3.0",
        "flask-sqlalchemy==3.1.1",
        "marshmallow==3.21.3",
        "minio==7.2.8",
        "mysqlclient==2.2.4",
        "sqlalchemy==2.0.31",
    ],
)
