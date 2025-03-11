from enum import IntEnum

from flask import jsonify


class APIErrorEnum(IntEnum):
    email_already_exists = 0
    wrong_email_password = 1
    wrong_email_totp_code = 2
    wrong_password = 3
    password_does_not_match_conditions = 4
    could_not_reset_password_with_token = 5
    token_expired = 6
    could_not_verify_email_with_token = 7
    must_be_admin = 8
    already_2fa_enabled = 9
    incorrect_totp_code = 10
    already_2fa_disabled = 11
    user_not_found = 12


class APIError(Exception):
    def __init__(self, code: APIErrorEnum, message: str, status: int = 400):
        self.code = code
        self.message = message
        self.status = status

    def to_response(self):
        return jsonify({"error": self.code.value, "message": self.message}), self.status


def handle_api_error(error: APIError):
    return error.to_response()
