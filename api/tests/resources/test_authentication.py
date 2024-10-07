from app.db.user import User, UserSchema


class TestAuthenticationAPI:
    def test_register(self, client, db, user):
        assert User.query.count() == 1
        response = client.post(
            "/register", json={"email": "new@user.com", "password": "white_wolf"}
        )

        assert response.status_code == 200

        assert User.query.count() == 2
        new_user = db.session.get(User, 2)
        assert new_user is not None

        assert response.json == UserSchema().dump(new_user)

        assert new_user.id == 2
        assert new_user.email == "new@user.com"
        assert not new_user.is_admin
        assert new_user.hashed_password is not None
        assert new_user.is_correct_password("white_wolf")

    def test_register_email_exists(self, client, db, user):
        assert User.query.count() == 1
        response = client.post(
            "/register", json={"email": "user@test.com", "password": "white_wolf"}
        )

        assert response.status_code == 409
        assert response.json == {
            "error_message": "An account with this email already exists"
        }
        assert User.query.count() == 1

    def test_login(self, client, db, user):
        response = client.post(
            "/login", json={"email": "user@test.com", "password": "password123"}
        )

        assert response.status_code == 200
        assert response.json == UserSchema().dump(user)

    def test_login_wrong_email(self, client, db, user):
        response = client.post(
            "/login", json={"email": "dijkstra@test.com", "password": "password123"}
        )

        assert response.status_code == 409
        assert response.json == {
            "error_message": "Could not login with the given email and password"
        }

    def test_login_wrong_password(self, client, db, user):
        response = client.post(
            "/login", json={"email": "user@test.com", "password": "gooseberries"}
        )

        assert response.status_code == 409
        assert response.json == {
            "error_message": "Could not login with the given email and password"
        }
