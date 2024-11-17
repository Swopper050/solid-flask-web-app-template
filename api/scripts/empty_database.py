from app.app import create_app
from app.config import DevConfig
from app.db.user import User
from app.extensions import db


def empty_database():
    db.reflect()
    db.drop_all()


def add_fixtures():
    app = create_app(config_object=DevConfig())
    with app.app_context():
        empty_database()


if __name__ == "__main__":
    add_fixtures()
