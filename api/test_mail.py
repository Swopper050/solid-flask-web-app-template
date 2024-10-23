import smtplib
import ssl

port = 465
smtp_server = "smtp.strato.com"
sender_email = "b.dewit@applyai.nl"  # Enter your address
receiver_email = "bram@witoos.nl"  # Enter receiver address
password = input("Type your password and press enter: ")
message = """\
Subject: Hi there

This message is sent from Python."""

context = ssl.create_default_context()
with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
    server.login(sender_email, password)
    server.sendmail(sender_email, receiver_email, message)
