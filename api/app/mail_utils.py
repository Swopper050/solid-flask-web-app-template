from string import Template

from flask_mail import Message

from app.config import (
    MY_SOLID_APP_FRONTEND_URL,
    MY_SOLID_APP_PASSWORD_RESET_TOKEN_EXPIRE_HOURS,
)
from app.extensions import mail


def send_forgot_password_email(*, receiver: str, reset_token: str):
    reset_link = (
        f"{MY_SOLID_APP_FRONTEND_URL}/reset-password?"
        f"email={receiver}&reset_token={reset_token}"
    )

    with open("./email_templates/forgot_password.html", "r") as file:
        html_content = file.read()

    html_content = Template(html_content).safe_substitute(
        reset_link=reset_link,
        reset_hours=MY_SOLID_APP_PASSWORD_RESET_TOKEN_EXPIRE_HOURS,
    )

    message = Message(
        subject="🛁 MySolidApp - Password reset",
        recipients=[receiver],
        html=html_content,
    )
    message.html
    mail.send(message)
