from flask import Flask

from app.extensions import api, login_manager, db
from app.config import DevConfig, TestConfig, ProdConfig


def create_app(config_object: DevConfig | ProdConfig | TestConfig = ProdConfig()):
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    login_manager.init_app(app)
    api.init_app(app)

    return app
