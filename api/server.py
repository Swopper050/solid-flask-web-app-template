from flask.helpers import get_debug_flag

from app.app import create_app
from app.config import DevConfig, ProdConfig

print(get_debug_flag())
CONFIG = DevConfig() if get_debug_flag() else ProdConfig()

app = create_app(config_object=CONFIG)
celery_app = app.extensions["celery"]
