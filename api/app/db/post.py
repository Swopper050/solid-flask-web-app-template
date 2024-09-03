from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import db
from app.db.user import User


class Post(db.Model):
    __tablename__ = "post"

    id: Mapped[int] = mapped_column(primary_key=True)

    posted_at: Mapped[int] = mapped_column()
    title: Mapped[str] = mapped_column(String(100))
    text: Mapped[str] = mapped_column(String(500))

    posted_by_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    posted_by: Mapped[User] = relationship(back_populates="posts")
