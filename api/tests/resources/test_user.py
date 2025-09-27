from unittest.mock import patch

from flask_login import current_user

from app.db.user import User
from app.errors import APIErrorEnum


class TestUsersAPI:
    def test_get_users_without_pagination(self, client, db, logged_in_user, admin):
        # There should be two users: the logged in user and the admin
        assert User.query.count() == 2

        response = client.get("/users")

        assert response.status_code == 200
        response_data = response.get_json()

        assert "items" in response_data
        assert len(response_data["items"]) == 2
        assert "meta" in response_data
        assert response_data["meta"] == {}

        # Verify user properties
        user_emails = [user["email"] for user in response_data["items"]]
        assert "user@test.com" in user_emails
        assert "admin@test.com" in user_emails

    def test_get_users_with_pagination(self, client, db, logged_in_user, admin):
        assert User.query.count() == 2

        response = client.get("/users?page=1&per_page=1")

        assert response.status_code == 200
        response_data = response.get_json()

        assert "items" in response_data
        assert (
            len(response_data["items"]) == 1
        )  # Should only return 1 user with per_page=1
        assert response_data["meta"]["total_items"] == 2
        assert response_data["meta"]["page"] == 1
        assert response_data["meta"]["per_page"] == 1
        assert response_data["meta"]["total_pages"] == 2

    def test_get_users_not_logged_in(self, client, db):
        response = client.get("/users")
        assert response.status_code == 401

    def test_create_user_as_admin(self, client, db, logged_in_admin):
        assert User.query.count() == 1

        with patch("app.resources.user.send_email_verification_email") as mock_email:
            # Create a new user
            response = client.post(
                "/users",
                json={
                    "email": "newuser@test.com",
                    "password": "newpassword123",
                    "is_admin": False,
                },
            )

            mock_email.delay.assert_called_once()

        assert response.status_code == 200
        assert User.query.count() == 2

        new_user = User.query.filter_by(email="newuser@test.com").first()
        assert new_user is not None
        assert new_user.is_admin is False
        assert (
            new_user.email_verification_token is not None
        )  # Verification token should be set

        # Verify response data
        response_data = response.get_json()
        assert response_data["email"] == "newuser@test.com"
        assert response_data["is_admin"] is False

    def test_create_duplicate_user(self, client, db, admin):
        # Login as admin
        client.post("/login", json={"email": admin.email, "password": "password321"})

        with patch("app.resources.user.send_email_verification_email") as mock_email:
            # Create the first user
            client.post(
                "/users",
                json={
                    "email": "duplicate@test.com",
                    "password": "password123",
                    "is_admin": False,
                },
            )

            mock_email.delay.assert_called_once()

        # Try to create a duplicate user
        response = client.post(
            "/users",
            json={
                "email": "duplicate@test.com",
                "password": "password456",
                "is_admin": False,
            },
        )

        assert response.status_code == 409
        assert response.get_json()["error"] == APIErrorEnum.email_already_exists.value
        assert "already exists" in response.get_json()["message"]

    def test_create_user_not_admin(self, client, db, logged_in_user):
        # User is logged in but not admin
        response = client.post(
            "/users",
            json={
                "email": "newuser@test.com",
                "password": "newpassword123",
                "is_admin": False,
            },
        )

        assert response.status_code == 403


class TestUserAPI:
    def test_delete_user_as_admin(self, client, db, logged_in_admin, user):
        user_id = user.id
        assert User.query.count() == 2

        response = client.delete(f"/user/{user_id}")

        assert response.status_code == 200
        assert User.query.count() == 1
        assert db.session.get(User, user_id) is None

    def test_delete_nonexistent_user(self, client, db, logged_in_admin):
        nonexistent_id = 99999

        response = client.delete(f"/user/{nonexistent_id}")

        assert response.status_code == 404
        assert response.get_json()["error"] == APIErrorEnum.user_not_found.value
        assert f"{nonexistent_id}" in response.get_json()["message"]

    def test_delete_user_not_admin(self, client, db, user, logged_in_user):
        # User is logged in but not admin
        user_id = user.id

        response = client.delete(f"/user/{user_id}")

        assert response.status_code == 403
        assert db.session.get(User, user_id) is not None


class TestDeleteAccountAPI:
    def test_delete_account(self, client, db, logged_in_user):
        assert User.query.count() == 1

        assert current_user.is_authenticated

        response = client.delete("/delete_account")

        assert response.status_code == 200
        assert not current_user.is_authenticated
        assert User.query.count() == 0

    def test_delete_account_not_logged_in(self, client, db, user):
        assert User.query.count() == 1

        response = client.delete("/delete_account")

        assert response.status_code == 401
        assert User.query.count() == 1
