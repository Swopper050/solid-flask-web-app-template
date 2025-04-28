import click
from flask.cli import with_appcontext

from app.db.user import User
from app.extensions import db


@click.command("create-admin")
@click.option("--email", required=True, help="Admin user email")
@click.option("--password", required=True, help="Admin user password")
@with_appcontext
def create_admin(email, password):
    """Create an initial admin user."""
    user = User.query.filter_by(email=email).first()
    if user:
        click.echo(f"User with email {email} already exists. Updating admin status.")
        user.is_admin = True
        user.is_verified = True
        if password:
            user.set_password(password)
    else:
        user = User(email=email, is_admin=True, is_verified=True)
        user.set_password(password)
        db.session.add(user)

    db.session.commit()
    click.echo(f"Admin user {email} created/updated successfully.")


def register_commands(app):
    """Register Flask CLI commands."""
    app.cli.add_command(create_admin)
