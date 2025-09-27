from string import Template

from celery import shared_task
from celery.utils.log import get_task_logger
from flask_mail import Message

from app.config import (
    MY_SOLID_APP_FRONTEND_URL,
    MY_SOLID_APP_PASSWORD_RESET_TOKEN_EXPIRE_HOURS,
)
from app.extensions import mail

logger = get_task_logger(__name__)


@shared_task(ignore_result=True)
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


@shared_task(ignore_result=True)
def send_email_verification_email(*, receiver: str, verification_token: str):
    verification_link = (
        f"{MY_SOLID_APP_FRONTEND_URL}/verify-email?"
        f"email={receiver}&verification_token={verification_token}"
    )

    with open("./email_templates/verify_email.html", "r") as file:
        html_content = file.read()

    html_content = Template(html_content).safe_substitute(
        verification_link=verification_link
    )

    message = Message(
        subject="🛁 MySolidApp - Email verification",
        recipients=[receiver],
        html=html_content,
    )
    message.html
    mail.send(message)
