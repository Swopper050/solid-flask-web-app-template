import smtplib
import ssl

from app.config import (
    MY_SOLID_APP_SMTP_HOST,
    MY_SOLID_APP_SMTP_PORT,
    MY_SOLID_APP_EMAIL_SENDER,
    MY_SOLID_APP_EMAIL_PASSWORD,
)


def send_email(
    receiver: str,
    message: str,
    host=MY_SOLID_APP_SMTP_HOST,
    port=MY_SOLID_APP_SMTP_PORT,
    sender=MY_SOLID_APP_EMAIL_SENDER,
    password=MY_SOLID_APP_EMAIL_PASSWORD,
):
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(host, port, context=context) as server:
        server.login(sender, password)
        server.sendmail(sender, receiver, message)


FORGOT_PASSWORD_EMAIL_TEMPLATE = """
Subject: MySolidApp - Password reset

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
        }
        .header img {
            width: 100px;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
        }
        p {
            font-size: 16px;
            line-height: 1.5;
            color: #555;
        }
        a.button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 20px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="cid:logo_image" alt="Company Logo">
            <h1>Password Reset Request</h1>
        </div>
        <p>Hello,</p>
        <p>We received a request to reset your password for your account. Click the button below to reset your password:</p>
        <a href="{reset_link}" class="button">Reset Password</a>
        <p>If you didn't request a password reset, please ignore this email. This link will expire in 24 hours.</p>
        <p>Thank you!</p>
        <div class="footer">
            <p>&copy; {year} Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""
