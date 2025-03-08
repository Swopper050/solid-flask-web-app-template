from flask import jsonify


class APIError(Exception):
    def __init__(self, code: int, message: str, status: int = 400):
        self.code = code
        self.message = message
        self.status = status

    def to_response(self):
        return jsonify({"error": self.code, "message": self.message}), self.status


def handle_api_error(error: APIError):
    return error.to_response()
