from app.app import create_app
from app.config import DevConfig
from app.db.user import User
from app.extensions import db


def add_users(db):
    user = User(
        email="admin@test.nl",
        is_admin=True,
    )
    user.set_password("admin")

    db.session.add(user)
    db.session.commit()


def add_fixtures():
    app = create_app(config_object=DevConfig())
    with app.app_context():
        add_users(db)


if __name__ == "__main__":
    add_fixtures()
