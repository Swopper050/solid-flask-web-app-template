from flask import Flask

import app.config as config

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = config.SQLALCHEMY_DATABASE_URL
app.config["SECRET_KEY"] = config.MYAPP_SECRET_KEY
