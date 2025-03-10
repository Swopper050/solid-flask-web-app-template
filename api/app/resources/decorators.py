from functools import wraps

from flask import request
from flask_login import current_user

from app.errors import APIError, APIErrorEnum


def insert_pagination_parameters(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        page = request.args.get("page")
        per_page = request.args.get("per_page")

        if page is not None and per_page is not None:
            return func(*args, page=int(page), per_page=int(per_page))
        else:
            return func(*args, **kwargs, page=None, per_page=None)

    return wrapper


def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not current_user.is_admin:
            raise APIError(
                APIErrorEnum.must_be_admin,
                "You must be an admin to access this resource",
                403,
            )

        return func(*args, **kwargs)

    return wrapper
