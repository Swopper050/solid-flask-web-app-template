import datetime as dt
from unittest.mock import patch

import pyotp
import pytest
from flask import session
from flask_login import current_user

from app.db.user import User, UserSchema
from app.errors import APIErrorEnum


class TestRegisterAPI:
    def test_register(self, client, db, user):
        assert User.query.count() == 1

        with patch(
            "app.resources.authentication.send_email_verification_email"
        ) as mock_email:
            response = client.post(
                "/register", json={"email": "new@user.com", "password": "white_wolf"}
            )

            mock_email.delay.assert_called_once()

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
        assert new_user.email_verification_token is not None

    def test_register_email_exists(self, client, user):
        assert User.query.count() == 1
        response = client.post(
            "/register", json={"email": "user@test.com", "password": "white_wolf"}
        )

        assert response.status_code == 409
        assert response.json["error"] == APIErrorEnum.email_already_exists.value
        assert response.json["message"] == "An account with this email already exists"
        assert User.query.count() == 1


class TestLoginAPI:
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

        assert response.status_code == 401
        assert response.json["error"] == APIErrorEnum.wrong_email_password.value
        assert (
            response.json["message"]
            == "Could not login with the given email and password"
        )

    def test_login_wrong_password(self, client, user):
        response = client.post(
            "/login", json={"email": "user@test.com", "password": "gooseberries"}
        )

        assert response.status_code == 401
        assert response.json["error"] == APIErrorEnum.wrong_email_password.value
        assert (
            response.json["message"]
            == "Could not login with the given email and password"
        )

    def test_login_with_2fa_enabled(self, db, client, user):
        user.two_factor_enabled = True
        db.session.add(user)
        db.session.commit()

        with client:
            response = client.post(
                "/login", json={"email": "user@test.com", "password": "password123"}
            )

            assert response.status_code == 200
            assert session["partially_authenticated_user"] == user.id


class TestLogin2FAAPI:
    @pytest.fixture
    def totp(self):
        return pyotp.TOTP(pyotp.random_base32())

    @pytest.fixture
    def user_with_2fa(self, db, user, totp):
        user.two_factor_enabled = True
        user.totp_secret = totp.secret
        db.session.add(user)
        db.session.commit()

        return user

    def test_login_2fa(self, client, user_with_2fa, totp):
        with client:
            # First part of the login
            response = client.post(
                "/login", json={"email": user_with_2fa.email, "password": "password123"}
            )

            assert response.status_code == 200
            assert session["partially_authenticated_user"] == user_with_2fa.id

            assert not current_user.is_authenticated

            # Now do the two factor login
            print(user_with_2fa.totp_secret)
            print(totp.now())
            print(totp.verify(totp.now()))

            response = client.post(
                "/login_2fa",
                json={"email": user_with_2fa.email, "totp_code": totp.now()},
            )

            assert response.status_code == 200
            assert response.json == UserSchema().dump(user_with_2fa)
            assert "partially_authenticated_user" not in session

            assert current_user.is_authenticated

    def test_login_2fa_wrong_email(self, client, user_with_2fa, totp):
        with client:
            response = client.post(
                "/login", json={"email": user_with_2fa.email, "password": "password123"}
            )
            assert response.status_code == 200

            response = client.post(
                "/login_2fa",
                json={"email": "dijkstra@test.com", "totp_code": totp.now()},
            )
            assert response.status_code == 401
            assert response.json["error"] == APIErrorEnum.wrong_email_totp_code.value
            assert (
                response.json["message"]
                == "Could not login with the given email and code"
            )

    def test_login_2fa_not_enabled(self, client, user, totp):
        with client:
            response = client.post(
                "/login_2fa",
                json={"email": user.email, "totp_code": totp.now()},
            )
            assert response.status_code == 401
            assert response.json["error"] == APIErrorEnum.wrong_email_totp_code.value
            assert (
                response.json["message"]
                == "Could not login with the given email and code"
            )

    def test_login_2fa_session_not_set(self, client, user_with_2fa, totp):
        with client:
            # Omit password login first

            response = client.post(
                "/login_2fa",
                json={"email": user_with_2fa.email, "totp_code": totp.now()},
            )
            assert response.status_code == 401
            assert response.json["error"] == APIErrorEnum.wrong_email_totp_code.value
            assert (
                response.json["message"]
                == "Could not login with the given email and code"
            )

    def test_login_2fa_session_for_different_user(
        self, client, user_with_2fa, admin, totp
    ):
        with client:
            # Login for user
            response = client.post(
                "/login", json={"email": user_with_2fa.email, "password": "password123"}
            )
            assert response.status_code == 200

            # Try to do the 2FA login for another user
            response = client.post(
                "/login_2fa",
                json={"email": admin.email, "totp_code": totp.now()},
            )
            assert response.status_code == 401
            assert response.json["error"] == APIErrorEnum.wrong_email_totp_code.value
            assert (
                response.json["message"]
                == "Could not login with the given email and code"
            )

    def test_login_2fa_wrong_code(self, client, user_with_2fa, totp):
        with client:
            response = client.post(
                "/login", json={"email": user_with_2fa.email, "password": "password123"}
            )
            assert response.status_code == 200

            response = client.post(
                "/login_2fa",
                json={
                    "email": user_with_2fa.email,
                    "totp_code": f"{int(totp.now()) + 1}",
                },
            )
            assert response.status_code == 401
            assert response.json["error"] == APIErrorEnum.wrong_email_totp_code.value
            assert (
                response.json["message"]
                == "Could not login with the given email and code"
            )


class TestLogoutAPI:
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


class TestChangePasswordAPI:
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
        assert (
            response.json["error"]
            == APIErrorEnum.password_does_not_match_conditions.value
        )
        assert response.json["message"] == "New password does not match conditions"

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
        assert response.json["error"] == APIErrorEnum.wrong_password.value
        assert response.json["message"] == "The current password is incorrect"
        assert user.is_correct_password("password123")


class TestForgotPasswordAPI:
    @patch("app.db.user.time")
    def test_forgot_password(self, time_mock, client, user):
        time_mock.time.return_value = 12345

        assert user.password_reset_token is None
        assert user.password_reset_time is None

        with patch(
            "app.resources.authentication.send_forgot_password_email"
        ) as mock_email:
            response = client.post(
                "/forgot_password",
                json={"email": user.email},
            )

            mock_email.delay.assert_called_once()

        assert response.status_code == 200

        assert user.password_reset_token is not None
        assert user.password_reset_time == 12345

    def test_forgot_password_user_does_not_exist(self, client, user):
        with patch(
            "app.resources.authentication.send_forgot_password_email"
        ) as mock_email:
            response = client.post(
                "/forgot_password",
                json={"email": "unknown@email.com"},
            )

            mock_email.delay.assert_not_called()

        assert response.status_code == 200


class TestResetPasswordAPI:
    @pytest.fixture
    def now(self):
        return dt.datetime(2024, 10, 26, 11, 5, 10)

    @patch("app.db.user.time")
    @patch("app.resources.authentication.time")
    def test_reset_password(self, reset_time, user_time, client, user, now):
        user_time.time.return_value = int((now - dt.timedelta(minutes=2)).timestamp())
        reset_time.time.return_value = int(now.timestamp())

        assert user.password_reset_token is None
        assert user.password_reset_time is None
        assert user.is_correct_password("password123")

        reset_token = user.set_password_reset_token()
        assert user.password_reset_token is not None
        assert user.password_reset_time == int(
            (now - dt.timedelta(minutes=2)).timestamp()
        )
        assert user.is_correct_password("password123")

        response = client.post(
            "/reset_password",
            json={
                "email": user.email,
                "reset_token": reset_token,
                "new_password": "Hello1234",
            },
        )

        assert response.status_code == 200

        assert user.password_reset_token is None
        assert user.password_reset_time is None
        assert user.is_correct_password("Hello1234")

    @patch("app.db.user.time")
    def test_reset_password_invalid_token(self, time_mock, client, user, now):
        time_mock.time.return_value = int(now.timestamp())

        user.set_password_reset_token()

        response = client.post(
            "/reset_password",
            json={
                "email": user.email,
                "reset_token": "wrong_token",
                "new_password": "Hello1234",
            },
        )

        assert response.status_code == 400
        assert (
            response.json["error"]
            == APIErrorEnum.could_not_reset_password_with_token.value
        )
        assert (
            response.json["message"] == "Could not reset password with the given token"
        )

        # Make sure the user reset tokens are not cleared yet.
        assert user.password_reset_token is not None
        assert user.password_reset_time == int(now.timestamp())
        assert user.is_correct_password("password123")

    def test_reset_password_invalid_email(self, client, user):
        response = client.post(
            "/reset_password",
            json={
                "email": "unknown@wow.nl",
                "reset_token": "12345",
                "new_password": "Hello1234",
            },
        )

        assert response.status_code == 400
        assert (
            response.json["error"]
            == APIErrorEnum.could_not_reset_password_with_token.value
        )
        assert (
            response.json["message"] == "Could not reset password with the given token"
        )

    @patch("app.db.user.time")
    @patch("app.resources.authentication.time")
    def test_reset_password_expired_token(
        self, reset_time, user_time, client, user, now
    ):
        # Mock the time such that the reset token was set 2 hours ago.
        user_time.time.return_value = int((now - dt.timedelta(hours=2)).timestamp())
        reset_time.time.return_value = int(now.timestamp())

        reset_token = user.set_password_reset_token()

        response = client.post(
            "/reset_password",
            json={
                "email": user.email,
                "reset_token": reset_token,
                "new_password": "Hello1234",
            },
        )

        assert response.status_code == 410
        assert response.json["error"] == APIErrorEnum.token_expired.value
        assert response.json["message"] == "This token has expired"

        # Make sure the user reset tokens are not cleared yet.
        assert user.password_reset_token is not None
        assert user.is_correct_password("password123")

    @patch("app.db.user.time")
    @patch("app.resources.authentication.time")
    def test_reset_password_new_password_invalid(
        self, reset_time, user_time, client, user, now
    ):
        # Mock the time such that the reset token was set 2 minutes ago.
        user_time.time.return_value = int((now - dt.timedelta(minutes=2)).timestamp())
        reset_time.time.return_value = int(now.timestamp())

        reset_token = user.set_password_reset_token()

        response = client.post(
            "/reset_password",
            json={
                "email": user.email,
                "reset_token": reset_token,
                "new_password": "invalid",
            },
        )

        assert response.status_code == 409
        assert (
            response.json["error"]
            == APIErrorEnum.password_does_not_match_conditions.value
        )
        assert response.json["message"] == "New password does not match conditions"

        # Make sure the user reset tokens are not cleared yet.
        assert user.password_reset_token is not None
        assert user.is_correct_password("password123")


class TestEmailVerificationAPI:
    def test_verify_email(self, db, client, user):
        token = user.set_email_verification_token()
        db.session.add(user)
        db.session.commit()

        assert user.email_verification_token is not None
        assert not user.is_verified

        response = client.post(
            "/verify_email",
            json={
                "email": user.email,
                "verification_token": token,
            },
        )

        assert response.status_code == 200
        assert user.email_verification_token is None
        assert user.is_verified

    def test_email_verification_invalid_token(self, db, client, user):
        user.set_email_verification_token()
        db.session.add(user)
        db.session.commit()

        response = client.post(
            "/verify_email",
            json={
                "email": user.email,
                "verification_token": "geralt",
            },
        )

        assert response.status_code == 400
        assert (
            response.json["error"]
            == APIErrorEnum.could_not_verify_email_with_token.value
        )
        assert response.json["message"] == "Could not verify email with the given token"

        # Make sure the user tokens are not cleared yet and user is not verified.
        assert user.email_verification_token is not None
        assert not user.is_verified

    def test_verify_email_invalid_email(self, client, user):
        response = client.post(
            "/verify_email",
            json={
                "email": "unknown@wow.nl",
                "verification_token": "12345",
            },
        )

        assert response.status_code == 400
        assert (
            response.json["error"]
            == APIErrorEnum.could_not_verify_email_with_token.value
        )
        assert response.json["message"] == "Could not verify email with the given token"


class TestResendVerifyEmailAPI:
    def test_resend_email_verification(self, db, client, logged_in_user):
        logged_in_user.set_email_verification_token()
        db.session.add(logged_in_user)
        db.session.commit()

        assert logged_in_user.email_verification_token is not None
        assert not logged_in_user.is_verified

        old_token = logged_in_user.email_verification_token

        with patch(
            "app.resources.authentication.send_email_verification_email"
        ) as mock_email:
            response = client.post(
                "/resend_email_verification",
            )

            mock_email.delay.assert_called_once()

        assert response.status_code == 200

        assert logged_in_user.email_verification_token != old_token

    def test_resend_email_verification_not_logged_in(self, db, client, user):
        user.set_email_verification_token()
        db.session.add(user)
        db.session.commit()

        assert user.email_verification_token is not None
        assert not user.is_verified

        old_token = user.email_verification_token

        response = client.post(
            "/resend_email_verification",
        )
        assert response.status_code == 401

        assert not user.is_verified
        assert user.email_verification_token == old_token


class TestWhoAmIAPI:
    def test_whoami(self, client, logged_in_user):
        response = client.get("/whoami")

        assert response.status_code == 200
        assert response.json == UserSchema().dump(logged_in_user)

    def test_whoami_not_logged_in(self, client, user):
        response = client.get("/whoami")
        assert response.status_code == 401
