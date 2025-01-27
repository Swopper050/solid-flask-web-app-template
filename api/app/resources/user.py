from flask_login import current_user, login_required, logout_user
from flask_restx import Resource

from app.db.user import User
from app.extensions import api, db


@api.route("/delete_account")
class DeleteAccount(Resource):
    @login_required
    def delete(self):
        user = User.query.get(current_user.id)

        logout_user()

        db.session.delete(user)
        db.session.commit()

        return {}, 200
