from app.app import create_app
from app.config import DevConfig
from app.extensions import db

if __name__ == "__main__":
    app = create_app(config_object=DevConfig())
    with app.app_context():
        db.reflect()
        db.drop_all()
