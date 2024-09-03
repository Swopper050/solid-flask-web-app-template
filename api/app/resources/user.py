import os
from io import BytesIO

from flask import request, send_file
from flask_jwt_extended import current_user, jwt_required
from flask_restx import Resource

import app.config as config
from app import api, db
from app.db.user import User, UserSchema
from app.db.utils import update_model
from app.minio import minio_client
from minio.error import S3Error


@api.route("/user/<int:id>")
class UserResource(Resource):
    @jwt_required()
    def get(self, id: int):
        if current_user is None:
            return {"error_message": "User is not logged in"}, 401

        if current_user.id == id:
            return UserSchema().dump(current_user)

        user = User.query.get(id)
        return UserSchema().dump(user)

    @jwt_required()
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


@api.route("/user/<int:id>/profile_picture")
class ProfilePictureResource(Resource):
    @jwt_required()
    def get(self, id: int):
        user = User.query.get(id)
        if user is None:
            return 404

        try:
            profile_picture = minio_client.get_object(
                config.MYAPP_MINIO_BUCKET, f"profile_picture_{id}"
            )
        except S3Error:
            return {"error_message": "could not get profile picture"}, 404

        return send_file(
            BytesIO(profile_picture.read()),
            mimetype=profile_picture.getheader("Content-Type"),
            as_attachment=False,
        )

    @jwt_required()
    def post(self, id: int):
        if current_user is None:
            return {"error_message": "User is not logged in"}, 401

        if current_user.id is not id:
            return {"error_message": "Action is not for the logged in user."}, 403

        profile_picture = request.files.get("profile_picture")
        if profile_picture is None:
            return {"error_message": "No profile picture found in the request"}, 400

        filename = f"profile_picture_{current_user.id}"

        try:
            minio_client.put_object(
                config.MYAPP_MINIO_BUCKET,
                filename,
                profile_picture.stream,
                os.fstat(profile_picture.fileno()).st_size,
                content_type=profile_picture.content_type,
            )
        except S3Error:
            return {"error_message": "could not upload profile picture"}, 503

        return UserSchema().dump(current_user)
