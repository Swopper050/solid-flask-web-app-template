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
