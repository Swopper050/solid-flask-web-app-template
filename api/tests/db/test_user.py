import pytest

from app.db.user import User


class TestUser:
    @pytest.mark.parametrize(
        "field",
        [
            "id",
            "email",
            "is_admin",
            "hashed_password",
            "password_reset_token",
            "password_reset_time",
            "email_verification_token",
            "is_verified",
            "two_factor_enabled",
            "encrypted_totp_secret",
        ],
    )
    def test_fields(self, field):
        assert hasattr(User, field)

    def test_set_password(self, user):
        user.hashed_password = None

        user.set_password("test_password")
        assert user.hashed_password is not None

        assert not user.is_correct_password("wrong")
        assert user.is_correct_password("test_password")

    def test_set_password_reset_token(self, user):
        assert user.password_reset_token is None
        assert user.password_reset_time is None

        user.set_password_reset_token()

        assert user.password_reset_token is not None
        assert user.password_reset_time is not None

    def test_check_password_reset_token(self, user):
        token = user.set_password_reset_token()
        assert user.check_password_reset_token(token)
        assert not user.check_password_reset_token("random_token")

    def test_check_password_reset_token_no_token(self, user):
        assert not user.check_password_reset_token("123456")

    def test_clear_password_reset_token(self, user):
        user.set_password_reset_token()

        assert user.password_reset_token is not None
        assert user.password_reset_time is not None

        user.clear_password_reset_token()

        assert user.password_reset_token is None
        assert user.password_reset_time is None

    def test_set_email_verification_token(self, user):
        assert user.email_verification_token is None

        user.set_email_verification_token()

        assert user.email_verification_token is not None

    def test_check_email_verification_token(self, user):
        token = user.set_email_verification_token()
        assert user.check_email_verification_token(token)
        assert not user.check_email_verification_token("random_token")

    def test_check_email_verification_token_no_token(self, user):
        assert not user.check_email_verification_token("123456")

    def test_clear_email_verification_token(self, user):
        user.set_email_verification_token()

        assert user.email_verification_token is not None

        user.clear_email_verification_token()

        assert user.email_verification_token is None
