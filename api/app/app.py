import logging
from logging.handlers import RotatingFileHandler

from celery import Celery, Task
from flask import Flask, request

from app.commands import register_commands
from app.config import DevConfig, ProdConfig, TestConfig
from app.errors import APIError, APIErrorEnum
from app.extensions import api, db, login_manager, mail, migrate


def create_app(config_object: DevConfig | ProdConfig | TestConfig = ProdConfig()):
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    login_manager.init_app(app)
    api.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    init_celery_app(app)

    register_commands(app)

    @api.errorhandler(APIError)
    def handle_api_error(error):
        app.logger.info(
            "%s %s - error: %s [%s %s]",
            request.method,
            request.path,
            error.status,
            error.code.value,
            error.code.name,
        )
        return error.to_response()

    @app.errorhandler(Exception)
    def handle_generic_error(error):
        app.logger.exception(
            "Internal Server Error: %s %s [%s] %s %s",
            request.method,
            request.path,
            500,
            str(error),
            repr(error),
        )
        return {
            "error": APIErrorEnum.unknown_error.value,
            "message": "An unknown error occurred",
        }, 500

    @app.after_request
    def logging_after_request(response):
        app.logger.info(
            "%s %s [%s] %s %s %s",
            request.method,
            request.path,
            response.status,
            request.referrer,
            request.remote_addr,
            request.user_agent,
        )
        return response

    gunicorn_logger = logging.getLogger("gunicorn.error")
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(logging.DEBUG if app.config["DEBUG"] else logging.INFO)

    if app.config["FILE_LOGGING"]:
        file_handler = RotatingFileHandler("api.log")
        file_handler.setLevel(logging.DEBUG if app.config["DEBUG"] else logging.INFO)
        file_handler.setFormatter(
            logging.Formatter(
                "%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
            )
        )
        app.logger.addHandler(file_handler)

    return app


def init_celery_app(app) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config["CELERY"])
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app
