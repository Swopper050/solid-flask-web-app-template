"""Add workspace and subscription models

Revision ID: 826709b8f4a1
Revises: d29daf4c6bc4
Create Date: 2026-04-26 15:13:44.230869

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "826709b8f4a1"
down_revision = "d29daf4c6bc4"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "workspace",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column("setup_completed", sa.Boolean(), nullable=False),
        sa.Column("color", sa.String(length=7), nullable=True),
        sa.Column("context", sa.String(length=2000), nullable=True),
        sa.Column("language", sa.String(length=5), server_default="nl", nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["user.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "workspace_invitation",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("hashed_token", sa.String(length=256), nullable=False),
        sa.Column("invited_by", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("accepted", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["invited_by"], ["user.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspace.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("workspace_invitation", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_workspace_invitation_email"), ["email"], unique=False
        )

    op.create_table(
        "workspace_member",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("joined_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspace.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "workspace_subscription",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("plan", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("mollie_customer_id", sa.String(length=50), nullable=True),
        sa.Column("mollie_subscription_id", sa.String(length=50), nullable=True),
        sa.Column("seats", sa.Integer(), nullable=False),
        sa.Column("billing_email", sa.String(length=255), nullable=True),
        sa.Column("billing_exempt", sa.Boolean(), nullable=False),
        sa.Column("billing_interval", sa.String(length=20), nullable=True),
        sa.Column(
            "billing_price_override", sa.Numeric(precision=10, scale=2), nullable=True
        ),
        sa.Column("paid_until", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["workspace_id"], ["workspace.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("workspace_id"),
    )
    op.create_table(
        "invoice",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("subscription_id", sa.Integer(), nullable=False),
        sa.Column("mollie_payment_id", sa.String(length=50), nullable=False),
        sa.Column("amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=False),
        sa.Column("seats", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["subscription_id"], ["workspace_subscription.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["workspace_id"], ["workspace.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("mollie_payment_id"),
    )
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.add_column(sa.Column("name", sa.String(length=100), nullable=False))


def downgrade():
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.drop_column("name")

    op.drop_table("invoice")
    op.drop_table("workspace_subscription")
    op.drop_table("workspace_member")
    with op.batch_alter_table("workspace_invitation", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_workspace_invitation_email"))

    op.drop_table("workspace_invitation")
    op.drop_table("workspace")
