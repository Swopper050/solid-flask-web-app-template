from flask import request
from flask_jwt_extended import create_access_token, current_user, jwt_required
from flask_restx import Resource
from marshmallow import Schema, fields

from app import api, db
from app.db.user import User, UserSchema


class RegisterSchema(Schema):
    name = fields.String(required=True)
    email = fields.String(required=True)
    password = fields.String(required=True)


@api.route("/register")
class Register(Resource):
    def post(self):
        data = RegisterSchema().load(request.get_json())

        if User.query.filter_by(email=data["email"]).first() is not None:
            return {"error_message": "A user with this email already exists"}, 409

        new_user = User(email=data["email"], name=data["name"])
        new_user.set_password(data["password"])

        db.session.add(new_user)
        db.session.commit()

        return {
            **UserSchema().dump(new_user),
            "access_token": create_access_token(identity=new_user),
        }


class LoginSchema(Schema):
    email = fields.String(required=True)
    password = fields.String(required=True)


@api.route("/login")
class Login(Resource):
    def post(self):
        data = LoginSchema().load(request.get_json())

        user = User.query.filter_by(email=data["email"]).first()
        if user is None or not user.is_correct_password(data["password"]):
            return {
                "error_message": "Could not login with the given email and password"
            }, 409

        return {
            **UserSchema().dump(user),
            "access_token": create_access_token(identity=user),
        }


@api.route("/whoami", methods=["GET"])
class WhoAmI(Resource):
    @jwt_required()
    def get(self):
        return UserSchema().dump(current_user)
