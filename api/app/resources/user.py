from flask import request
from flask_login import current_user, login_required
from flask_restx import Resource

from app.db.user import User, UserSchema
from app.db.utils import update_model
from app.extensions import api, db


@api.route("/user/<int:id>")
class UserResource(Resource):
    @login_required
    def get(self, id: int):
        if current_user is None:
            return {"error_message": "User is not logged in"}, 401

        if current_user.id == id:
            return UserSchema().dump(current_user)

        user = User.query.get(id)
        return UserSchema().dump(user)

    @login_required
    def put(self, id: int):
        if current_user is None:
            return {"error_message": "User is not logged in"}, 401

        if current_user.id is not id:
            return {"error_message": "Action is not for the logged in user."}, 403

        data = UserSchema().load(request.get_json(), unknown="exclude")
        update_model(current_user, data)

        db.session.add(current_user)
        db.session.commit()

        return UserSchema().dump(current_user)
