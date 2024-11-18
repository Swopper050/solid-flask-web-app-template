"""Add email verification and 2FA

Revision ID: d29daf4c6bc4
Revises: cc2b162fd7e1
Create Date: 2024-11-17 13:54:14.218066

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d29daf4c6bc4"
down_revision = "cc2b162fd7e1"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("email_verification_token", sa.String(length=256), nullable=True)
        )
        batch_op.add_column(sa.Column("is_verified", sa.Boolean(), nullable=False))
        batch_op.add_column(
            sa.Column("two_factor_enabled", sa.Boolean(), nullable=False)
        )
        batch_op.add_column(
            sa.Column("encrypted_totp_secret", sa.String(length=256), nullable=True)
        )


def downgrade():
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.drop_column("encrypted_totp_secret")
        batch_op.drop_column("two_factor_enabled")
        batch_op.drop_column("is_verified")
        batch_op.drop_column("email_verification_token")
