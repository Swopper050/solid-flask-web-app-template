"""Added password reset fields

Revision ID: cc2b162fd7e1
Revises: 592b4068cc1a
Create Date: 2024-10-27 10:26:00.511073

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "cc2b162fd7e1"
down_revision = "592b4068cc1a"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("password_reset_token", sa.String(length=256), nullable=True)
        )
        batch_op.add_column(
            sa.Column("password_reset_time", sa.Integer(), nullable=True)
        )


def downgrade():
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.drop_column("password_reset_time")
        batch_op.drop_column("password_reset_token")
