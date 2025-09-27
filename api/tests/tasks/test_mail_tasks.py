import re

from app.extensions import mail
from app.tasks.mail_tasks import (
    send_email_verification_email,
    send_forgot_password_email,
)


class TestMailTasks:
    def test_send_email_verification_mail(self, client, db, user):
        user_token = user.set_email_verification_token()

        with mail.record_messages() as outbox:
            send_email_verification_email(
                receiver=user.email, verification_token=user_token
            )
            assert len(outbox) == 1
            assert outbox[0].subject == "🛁 MySolidApp - Email verification"
            assert outbox[0].recipients == [user.email]
            assert outbox[0].html is not None
            token = re.search(r"verification_token=([\w-]+)", outbox[0].html).group(1)

        assert user.check_email_verification_token(token)

    def test_send_forgot_password_mail(self, client, db, user):
        user_token = user.set_password_reset_token()

        with mail.record_messages() as outbox:
            send_forgot_password_email(receiver=user.email, reset_token=user_token)
            assert len(outbox) == 1
            assert outbox[0].subject == "🛁 MySolidApp - Password reset"
            assert outbox[0].recipients == [user.email]
            assert outbox[0].html is not None
            token = re.search(r"reset_token=([\w-]+)", outbox[0].html).group(1)

        assert user.check_password_reset_token(token)
