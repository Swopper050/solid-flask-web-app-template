import secrets
from datetime import datetime

from marshmallow import Schema, fields
from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from werkzeug.security import check_password_hash, generate_password_hash

from app.db.fields import UTCDateTime
from app.extensions import db


class WorkspaceMemberRole:
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


WORKSPACE_LANGUAGES = ("nl", "en")
DEFAULT_WORKSPACE_LANGUAGE = "nl"


class Workspace(db.Model):
    __tablename__ = "workspace"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )
    setup_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    color: Mapped[str | None] = mapped_column(String(7), nullable=True)
    context: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    language: Mapped[str] = mapped_column(
        String(5), default=DEFAULT_WORKSPACE_LANGUAGE, server_default="nl"
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    members: Mapped[list["WorkspaceMember"]] = relationship(
        "WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan"
    )
    invitations: Mapped[list["WorkspaceInvitation"]] = relationship(
        "WorkspaceInvitation", back_populates="workspace", cascade="all, delete-orphan"
    )


class WorkspaceMember(db.Model):
    __tablename__ = "workspace_member"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspace.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"))
    role: Mapped[str] = mapped_column(String(20), default=WorkspaceMemberRole.MEMBER)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="members")
    user: Mapped["db.Model"] = relationship("User")


class WorkspaceInvitation(db.Model):
    __tablename__ = "workspace_invitation"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspace.id"))
    email: Mapped[str] = mapped_column(String(100), index=True)
    hashed_token: Mapped[str] = mapped_column(String(256))
    invited_by: Mapped[int | None] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    accepted: Mapped[bool] = mapped_column(default=False)

    workspace: Mapped["Workspace"] = relationship(
        "Workspace", back_populates="invitations"
    )
    inviter: Mapped["db.Model | None"] = relationship("User", foreign_keys=[invited_by])

    def set_token(self) -> str:
        token = secrets.token_urlsafe(32)
        self.hashed_token = generate_password_hash(token)
        return token

    def check_token(self, token: str) -> bool:
        return check_password_hash(self.hashed_token, token)


class WorkspaceMemberSchema(Schema):
    id = fields.Integer()
    workspace_id = fields.Integer()
    user_id = fields.Integer()
    role = fields.String()
    joined_at = UTCDateTime()
    email = fields.Method("get_email")
    name = fields.Method("get_name")

    def get_email(self, obj: WorkspaceMember) -> str:
        return obj.user.email if obj.user else ""

    def get_name(self, obj: WorkspaceMember) -> str:
        return obj.user.name if obj.user else ""


class WorkspaceSchema(Schema):
    id = fields.Integer()
    name = fields.String()
    color = fields.String(allow_none=True)
    context = fields.String(allow_none=True)
    language = fields.String()
    setup_completed = fields.Boolean()
    created_by = fields.Integer(allow_none=True)
    created_at = UTCDateTime()
    members = fields.List(fields.Nested(WorkspaceMemberSchema))


class WorkspaceListItemSchema(Schema):
    id = fields.Integer()
    name = fields.String()
    color = fields.String(allow_none=True)
    setup_completed = fields.Boolean()
    role = fields.String()
    member_count = fields.Integer()


class WorkspaceInvitationSchema(Schema):
    id = fields.Integer()
    workspace_id = fields.Integer()
    email = fields.String()
    invited_by = fields.Integer()
    created_at = UTCDateTime()
    accepted = fields.Boolean()
