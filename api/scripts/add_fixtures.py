from app import app, db
from app.db import User


def add_users(db):
    user = User(
        email="admin@test.nl",
        is_admin=True,
    )
    user.set_password("admin")

    db.session.add(user)
    db.session.commit()


def add_fixtures():
    with app.app_context():
        db.create_all()

        add_users(db)


if __name__ == "__main__":
    add_fixtures()
