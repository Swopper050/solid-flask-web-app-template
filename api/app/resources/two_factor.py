from io import BytesIO
import base64
from flask_login import login_required
from flask_restx import Resource
import pyotp
import qrcode

from app.extensions import api


@api.route("/generate_totp_secret")
class GenerateTOTPSecret(Resource):
    @login_required
    def get(self):
        totp = pyotp.TOTP(pyotp.random_base32())

        uri = totp.provisioning_uri(name="user@example.com", issuer_name="YourAppName")
        qr = qrcode.make(uri)

        buffered = BytesIO()
        qr.save(buffered, format="PNG")

        return {
            "qr_code": base64.b64encode(buffered.getvalue()).decode(),
            "totp_secret": totp.secret,
        }, 200
