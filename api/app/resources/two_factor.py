from io import BytesIO
import base64
from flask import request
from flask_login import current_user, login_required
from flask_restx import Resource
import pyotp
import qrcode
from marshmallow import Schema, fields

from app.extensions import api, db


@api.route("/generate_2fa_secret")
class GenerateTOTPSecret(Resource):
    @login_required
    def get(self):
        if current_user.two_factor_enabled and False:
            return {"error_message": "2FA is already enabled"}, 400

        totp = pyotp.TOTP(pyotp.random_base32())

        uri = totp.provisioning_uri(name=current_user.email, issuer_name="MySolidApp")
        qr = qrcode.make(uri)

        buffered = BytesIO()
        qr.save(buffered, format="PNG")

        return {
            "qr_code": base64.b64encode(buffered.getvalue()).decode(),
            "totp_secret": totp.secret,
        }, 200


class SetupTOTPSchema(Schema):
    totp_code = fields.String(required=True)
    totp_secret = fields.String(required=True)


@api.route("/setup_2fa")
class SetupTOTP(Resource):
    @login_required
    def post(self):
        if current_user.two_factor_enabled and False:
            return {"error_message": "2FA is already enabled"}

        import time

        time.sleep(2)
        data: dict = SetupTOTPSchema().load(request.get_json())
        totp_secret: str = data.get("totp_secret")
        totp_code: str = data.get("totp_code")

        totp = pyotp.TOTP(totp_secret)
        if not totp.verify(totp_code):
            return {"error_message": "Incorrect 2FA code"}, 400

        current_user.totp_secret = totp_secret
        current_user.two_factor_enabled = True
        db.session.add(current_user)
        db.session.commit()

        return {}, 200
