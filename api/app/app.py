from flask import Flask

from app.config import DevConfig, ProdConfig, TestConfig
from app.extensions import api, db, login_manager, migrate


def create_app(config_object: DevConfig | ProdConfig | TestConfig = ProdConfig()):
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    login_manager.init_app(app)
    api.init_app(app)
    migrate.init_app(app, db)

    return app
