import base64
from io import BytesIO

import pyotp
import qrcode
from flask import request
from flask_login import current_user, login_required
from flask_restx import Resource
from marshmallow import Schema, fields

from app.errors import APIError, APIErrorEnum
from app.extensions import api, db


@api.route("/generate_2fa_secret")
class Generate2FASecret(Resource):
    @login_required
    def get(self):
        if current_user.two_factor_enabled:
            raise APIError(
                APIErrorEnum.already_2fa_enabled,
                "2FA is already enabled",
                400,
            )

        totp = pyotp.TOTP(pyotp.random_base32())

        uri = totp.provisioning_uri(name=current_user.email, issuer_name="MySolidApp")
        qr = qrcode.make(uri)

        buffered = BytesIO()
        qr.save(buffered, format="PNG")

        return {
            "qr_code": base64.b64encode(buffered.getvalue()).decode(),
            "totp_secret": totp.secret,
        }, 200


class Enable2FASchema(Schema):
    totp_code = fields.String(required=True)
    totp_secret = fields.String(required=True)


@api.route("/enable_2fa")
class Enable2FA(Resource):
    @login_required
    def post(self):
        if current_user.two_factor_enabled:
            raise APIError(
                APIErrorEnum.already_2fa_enabled,
                "2FA is already enabled",
                400,
            )

        data: dict = Enable2FASchema().load(request.get_json())
        totp_secret: str = data.get("totp_secret")
        totp_code: str = data.get("totp_code")

        totp = pyotp.TOTP(totp_secret)
        if not totp.verify(totp_code):
            raise APIError(
                APIErrorEnum.incorrect_totp_code,
                "Incorrect 2FA code",
                401,
            )

        current_user.totp_secret = totp_secret
        current_user.two_factor_enabled = True
        db.session.add(current_user)
        db.session.commit()

        return {}, 200


class Disable2FASchema(Schema):
    totp_code = fields.String(required=True)


@api.route("/disable_2fa")
class Disable2FA(Resource):
    @login_required
    def post(self):
        if not current_user.two_factor_enabled:
            raise APIError(
                APIErrorEnum.already_2fa_disabled,
                "2FA is already disabled",
                400,
            )

        data: dict = Disable2FASchema().load(request.get_json())
        totp_code: str = data.get("totp_code")

        totp = pyotp.TOTP(current_user.totp_secret)
        if not totp.verify(totp_code):
            raise APIError(
                APIErrorEnum.incorrect_totp_code,
                "Incorrect 2FA code",
                401,
            )

        current_user.totp_secret = None
        current_user.two_factor_enabled = False
        db.session.add(current_user)
        db.session.commit()

        return {}, 200
