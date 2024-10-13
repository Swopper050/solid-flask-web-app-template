from flask_login import current_user

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

    def test_register_email_exists(self, client, user):
        assert User.query.count() == 1
        response = client.post(
            "/register", json={"email": "user@test.com", "password": "white_wolf"}
        )

        assert response.status_code == 409
        assert response.json == {
            "error_message": "An account with this email already exists"
        }
        assert User.query.count() == 1

    def test_login(self, client, user):
        response = client.post(
            "/login", json={"email": "user@test.com", "password": "password123"}
        )

        assert response.status_code == 200
        assert response.json == UserSchema().dump(user)

    def test_login_wrong_email(self, client, user):
        response = client.post(
            "/login", json={"email": "dijkstra@test.com", "password": "password123"}
        )

        assert response.status_code == 409
        assert response.json == {
            "error_message": "Could not login with the given email and password"
        }

    def test_login_wrong_password(self, client, user):
        response = client.post(
            "/login", json={"email": "user@test.com", "password": "gooseberries"}
        )

        assert response.status_code == 409
        assert response.json == {
            "error_message": "Could not login with the given email and password"
        }

    def test_logout(self, client, user):
        # Login user
        response = client.post(
            "/login", json={"email": "user@test.com", "password": "password123"}
        )

        assert response.status_code == 200
        assert current_user == user

        response = client.post("/logout")

        assert response.status_code == 200
        assert current_user != user

    def test_logout_not_logged_in(self, client, user):
        response = client.post("/logout")

        assert response.status_code == 401

    def test_change_password(self, client, user):
        # Login user
        response = client.post(
            "/login", json={"email": "user@test.com", "password": "password123"}
        )

        assert response.status_code == 200
        assert user.is_correct_password("password123")

        # Now test the password change
        response = client.post(
            "/change_password",
            json={"current_password": "password123", "new_password": "White_wolf123"},
        )

        assert response.status_code == 200
        assert user.is_correct_password("White_wolf123")

    def test_change_password_wrong_conditions(self, client, user):
        response = client.post(
            "/login", json={"email": "user@test.com", "password": "password123"}
        )

        assert response.status_code == 200
        assert user.is_correct_password("password123")

        # New password that does not match the conditions
        response = client.post(
            "/change_password",
            json={"current_password": "password123", "new_password": "white_wolf"},
        )

        assert response.status_code == 409
        assert response.json == {
            "error_message": "New password does not match conditions"
        }

    def test_change_password_not_logged_in(self, client, user):
        assert user.is_correct_password("password123")

        response = client.post(
            "/change_password",
            json={"current_password": "password123", "new_password": "white_wolf"},
        )

        assert response.status_code == 401
        assert user.is_correct_password("password123")

    def test_change_password_wrong_current_password(self, client, user):
        # Login user
        response = client.post(
            "/login", json={"email": "user@test.com", "password": "password123"}
        )

        assert response.status_code == 200
        assert user.is_correct_password("password123")

        response = client.post(
            "/change_password",
            json={"current_password": "this_is_wrong", "new_password": "white_wolf"},
        )

        assert response.status_code == 409
        assert response.json == {"error_message": "The current password is incorrect"}
        assert user.is_correct_password("password123")
