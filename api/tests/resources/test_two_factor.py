import pyotp

from app.errors import APIErrorEnum


class TestGenerate2FASecretAPI:
    def test_generate_2fa_secret(self, client, logged_in_user):
        logged_in_user.two_factor_enabled = False

        response = client.get("/generate_2fa_secret")
        assert response.status_code == 200

        data = response.json
        assert "qr_code" in data
        assert "totp_secret" in data

    def test_generate_2fa_secret_not_logged_in(self, client, user):
        response = client.get("/generate_2fa_secret")
        assert response.status_code == 401

    def test_generate_2fa_secret_2fa_enabled(self, db, client, logged_in_user):
        logged_in_user.two_factor_enabled = True
        db.session.add(logged_in_user)
        db.session.commit()

        response = client.get("/generate_2fa_secret")
        assert response.status_code == 400
        assert response.json["error"] == APIErrorEnum.already_2fa_enabled.value
        assert response.json["message"] == "2FA is already enabled"


class TestEnable2FAAPI:
    def test_enable_2fa(self, client, logged_in_user):
        assert not logged_in_user.two_factor_enabled

        totp = pyotp.TOTP(pyotp.random_base32())
        response = client.post(
            "/enable_2fa", json={"totp_code": totp.now(), "totp_secret": totp.secret}
        )

        assert response.status_code == 200
        assert logged_in_user.two_factor_enabled
        assert logged_in_user.encrypted_totp_secret is not None
        assert logged_in_user.totp_secret == totp.secret

    def test_enable_2fa_already_enabled(self, db, client, logged_in_user):
        logged_in_user.two_factor_enabled = True
        db.session.add(logged_in_user)
        db.session.commit()

        totp = pyotp.TOTP(pyotp.random_base32())
        response = client.post(
            "/enable_2fa", json={"totp_code": totp.now(), "totp_secret": totp.secret}
        )
        assert response.status_code == 400
        assert response.json["error"] == APIErrorEnum.already_2fa_enabled.value
        assert response.json["message"] == "2FA is already enabled"

    def test_enable_2fa_incorrect_code(self, client, logged_in_user):
        totp = pyotp.TOTP(pyotp.random_base32())
        response = client.post(
            "/enable_2fa",
            json={"totp_code": f"{int(totp.now()) + 1}", "totp_secret": totp.secret},
        )

        assert response.status_code == 401
        assert response.json["error"] == APIErrorEnum.incorrect_totp_code.value
        assert response.json["message"] == "Incorrect 2FA code"

    def test_enable_2fa_not_logged_in(self, db, client, user):
        totp = pyotp.TOTP(pyotp.random_base32())
        response = client.post(
            "/enable_2fa", json={"totp_code": totp.now(), "totp_secret": totp.secret}
        )
        assert response.status_code == 401


class TestDisable2FAAPI:
    def test_disable_2fa(self, db, client, logged_in_user):
        totp = pyotp.TOTP(pyotp.random_base32())

        logged_in_user.two_factor_enabled = True
        logged_in_user.totp_secret = totp.secret
        db.session.add(logged_in_user)
        db.session.commit()

        assert logged_in_user.two_factor_enabled

        response = client.post("/disable_2fa", json={"totp_code": totp.now()})

        assert response.status_code == 200
        assert not logged_in_user.two_factor_enabled
        assert logged_in_user.encrypted_totp_secret is None
        assert logged_in_user.totp_secret is None

    def test_disable_2fa_already_disabled(self, db, client, logged_in_user):
        assert not logged_in_user.two_factor_enabled

        response = client.post("/disable_2fa", json={"totp_code": "123456"})

        assert response.status_code == 400
        assert response.json["error"] == APIErrorEnum.already_2fa_disabled.value
        assert response.json["message"] == "2FA is already disabled"

    def test_disable_2fa_incorrect_code(self, db, client, logged_in_user):
        totp = pyotp.TOTP(pyotp.random_base32())

        logged_in_user.two_factor_enabled = True
        logged_in_user.totp_secret = totp.secret
        db.session.add(logged_in_user)
        db.session.commit()

        assert logged_in_user.two_factor_enabled

        response = client.post(
            "/disable_2fa", json={"totp_code": f"{int(totp.now()) + 1}"}
        )

        assert response.status_code == 401
        assert response.json["error"] == APIErrorEnum.incorrect_totp_code.value
        assert response.json["message"] == "Incorrect 2FA code"
        assert logged_in_user.two_factor_enabled

    def test_disable_2fa_not_logged_in(self, client, user):
        response = client.post("/disable_2fa", json={"totp_code": "123456"})

        assert response.status_code == 401
