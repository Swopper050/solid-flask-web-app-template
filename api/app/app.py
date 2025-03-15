import logging
from logging.handlers import RotatingFileHandler

from flask import Flask, request

from app.config import DevConfig, ProdConfig, TestConfig
from app.errors import APIError
from app.extensions import api, db, login_manager, mail, migrate


def create_app(config_object: DevConfig | ProdConfig | TestConfig = ProdConfig()):
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    login_manager.init_app(app)
    api.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)

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

    gunicorn_logger = logging.getLogger("gunicorn.error")
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(logging.DEBUG if app.config["DEBUG"] else logging.INFO)

    file_handler = RotatingFileHandler("api.log")
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(
        logging.Formatter(
            "%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
        )
    )
    app.logger.addHandler(file_handler)

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

    return app
