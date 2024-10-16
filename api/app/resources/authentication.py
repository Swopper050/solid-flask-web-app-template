import re

from flask import request
from flask_login import current_user, login_required, login_user, logout_user
from flask_restx import Resource
from marshmallow import Schema, fields

from app.db.user import User, UserSchema
from app.extensions import api, db, login_manager


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


class RegisterSchema(Schema):
    email = fields.String(required=True)
    password = fields.String(required=True)


@api.route("/register")
class Register(Resource):
    def post(self):
        data: dict = RegisterSchema().load(request.get_json())

        if User.query.filter_by(email=data.get("email")).first() is not None:
            return {"error_message": "An account with this email already exists"}, 409

        new_user = User(email=data.get("email"))
        new_user.set_password(data.get("password"))

        db.session.add(new_user)
        db.session.commit()

        login_user(new_user)

        return UserSchema().dump(new_user)


class LoginSchema(Schema):
    email = fields.String(required=True)
    password = fields.String(required=True)


@api.route("/login")
class Login(Resource):
    def post(self):
        data: dict = LoginSchema().load(request.get_json())

        user = User.query.filter_by(email=data.get("email")).first()
        if user is None or not user.is_correct_password(data.get("password")):
            return {
                "error_message": "Could not login with the given email and password"
            }, 409

        login_user(user)

        return UserSchema().dump(user)


@api.route("/logout")
class Logout(Resource):
    @login_required
    def post(self):
        logout_user()
        return {}, 200


class ChangePasswordSchema(Schema):
    current_password = fields.String(required=True)
    new_password = fields.String(required=True)


@api.route("/change_password")
class ChangePassword(Resource):
    @login_required
    def post(self):
        data: dict = ChangePasswordSchema().load(request.get_json())

        if not current_user.is_correct_password(data.get("current_password")):
            return {"error_message": "The current password is incorrect"}, 409

        new_password = data.get("new_password")
        if new_password is None or not password_matches_conditions(new_password):
            return {"error_message": "New password does not match conditions"}, 409

        current_user.set_password(new_password)

        db.session.add(current_user)
        db.session.commit()

        return UserSchema().dump(current_user)


def password_matches_conditions(password: str) -> bool:
    return (
        len(password) >= 8
        and re.search("[A-Z]", password) is not None
        and re.search("[a-z]", password) is not None
        and re.search("[0-9]", password) is not None
    )


@api.route("/whoami")
class WhoAmI(Resource):
    @login_required
    def get(self):
        return UserSchema().dump(current_user)
