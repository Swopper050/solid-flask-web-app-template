from flask import request
from flask_login import current_user, login_required, logout_user
from flask_restx import Resource
from marshmallow import Schema, fields

from app.db.user import User, UserSchema
from app.errors import APIError, APIErrorEnum
from app.extensions import api, db
from app.resources.decorators import admin_required, insert_pagination_parameters
from app.resources.utils import pagination_query
from app.tasks.mail_tasks import send_email_verification_email


class CreateUserSchema(Schema):
    email = fields.String(required=True)
    password = fields.String(required=True)
    is_admin = fields.Boolean(required=True)


@api.route("/users")
class UsersAPI(Resource):
    @login_required
    @insert_pagination_parameters
    def get(self, page: int | None = None, per_page: int | None = None):
        if page and per_page:
            users, meta = pagination_query(User, int(page), int(per_page))
        else:
            users = User.query.all()
            meta = {}

        return {"items": UserSchema(many=True).dump(users), "meta": meta}

    @admin_required
    def post(self):
        user_data: dict = CreateUserSchema().load(request.get_json())
        if User.query.filter_by(email=user_data.get("email")).first() is not None:
            raise APIError(
                APIErrorEnum.email_already_exists,
                "An account with this email already exists",
                409,
            )

        new_user = User(email=user_data.get("email"), is_admin=user_data.get("is_admin"))
        new_user.set_password(user_data.get("password"))

        db.session.add(new_user)
        db.session.commit()

        verification_token = new_user.set_email_verification_token()

        send_email_verification_email.delay(
            receiver=new_user.email, verification_token=verification_token
        )

        db.session.add(new_user)
        db.session.commit()

        return UserSchema().dump(new_user)


@api.route("/user/<int:id>")
class UserAPI(Resource):
    @admin_required
    def delete(self, id):
        user = db.session.get(User, id)
        if not user:
            raise APIError(
                APIErrorEnum.user_not_found, f"User with id {id} not found", 404
            )

        db.session.delete(user)
        db.session.commit()

        return {}, 200


@api.route("/delete_account")
class DeleteAccount(Resource):
    @login_required
    def delete(self):
        user = db.session.get(User, current_user.id)

        logout_user()

        db.session.delete(user)
        db.session.commit()

        return {}, 200
