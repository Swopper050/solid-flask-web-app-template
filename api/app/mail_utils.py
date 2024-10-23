import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from string import Template

from app.config import (
    MY_SOLID_APP_EMAIL_PASSWORD,
    MY_SOLID_APP_EMAIL_RESET_TOKEN_EXPIRE_HOURS,
    MY_SOLID_APP_EMAIL_SENDER,
    MY_SOLID_APP_FRONTEND_URL,
    MY_SOLID_APP_SMTP_HOST,
    MY_SOLID_APP_SMTP_PORT,
)


def send_email(
    *,
    receiver: str,
    message: MIMEMultipart,
    host=MY_SOLID_APP_SMTP_HOST,
    port=MY_SOLID_APP_SMTP_PORT,
    sender=MY_SOLID_APP_EMAIL_SENDER,
    password=MY_SOLID_APP_EMAIL_PASSWORD,
):
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=context) as server:
        server.login(sender, password)
        server.sendmail(sender, receiver, message.as_string())


def get_forgot_password_email_message(
    *, receiver: str, reset_token: str, sender: str = MY_SOLID_APP_EMAIL_SENDER
):
    reset_link = (
        f"{MY_SOLID_APP_FRONTEND_URL}/reset-password?"
        f"email={receiver}&reset_token={reset_token}"
    )

    message = MIMEMultipart("alternative")
    message["Subject"] = "🛁 MySolidApp - Password reset"
    message["From"] = sender
    message["To"] = receiver

    with open("./email_templates/forgot_password.html", "r") as file:
        html_body = file.read()

    html_body = Template(html_body).safe_substitute(
        reset_link=reset_link, reset_hours=MY_SOLID_APP_EMAIL_RESET_TOKEN_EXPIRE_HOURS
    )
    message.attach(MIMEText(html_body, "html"))

    return message
