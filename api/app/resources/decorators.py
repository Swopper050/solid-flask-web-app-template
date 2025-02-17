from functools import wraps

from flask import request


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
