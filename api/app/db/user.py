from typing import TYPE_CHECKING, List

from flask_login import UserMixin
from marshmallow import Schema, fields, validate
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from werkzeug.security import check_password_hash, generate_password_hash

from app.db.database import db

if TYPE_CHECKING:
    from app.db.post import Post


class User(db.Model, UserMixin):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)

    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    is_admin: Mapped[bool] = mapped_column(default=False)
    hashed_password: Mapped[str] = mapped_column(String(256))

    posts: Mapped[List["Post"]] = relationship()

    def set_password(self, password: str):
        self.hashed_password = generate_password_hash(password)

    def is_correct_password(self, password: str) -> bool:
        return check_password_hash(self.hashed_password, password)


class UserSchema(Schema):
    id = fields.Integer()
    email = fields.String(validate=validate.Length(max=100))
    is_admin = fields.Boolean()
