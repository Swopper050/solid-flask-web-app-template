from flask_login import current_user, login_required, logout_user
from flask_restx import Resource

from app.db.user import User, UserSchema
from app.extensions import api, db
from app.resources.decorators import insert_pagination_parameters
from app.resources.utils import pagination_query


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


@api.route("/delete_account")
class DeleteAccount(Resource):
    @login_required
    def delete(self):
        user = User.query.get(current_user.id)

        logout_user()

        db.session.delete(user)
        db.session.commit()

        return {}, 200
