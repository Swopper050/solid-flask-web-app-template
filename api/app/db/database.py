from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

from app.app import app


class ModelBase(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=ModelBase)
db.init_app(app)
