"""Added name column to user table

Revision ID: 6eba75463cb9
Revises: d29daf4c6bc4
Create Date: 2026-03-21 15:25:28.636095

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "6eba75463cb9"
down_revision = "d29daf4c6bc4"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.add_column(sa.Column("name", sa.String(length=100), nullable=True))

    connection = op.get_bind()
    connection.execute(sa.text("UPDATE user SET name = '-' WHERE name IS NULL"))


def downgrade():
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.drop_column("name")
