from flask_login import current_user

from app.db.user import User


class TestDeleteAccountAPI:
    def test_delete_account(self, client, db, logged_in_user):
        assert User.query.count() == 1

        assert current_user.is_authenticated

        response = client.delete("/delete_account")

        assert response.status_code == 200
        assert not current_user.is_authenticated
        assert User.query.count() == 0

    def test_delete_account_not_logged_in(self, client, db, user):
        assert User.query.count() == 1

        response = client.delete("/delete_account")

        assert response.status_code == 401
        assert User.query.count() == 1
