from app.app import create_app
from app.config import DevConfig
from app.db.user import User
from app.db.workspace import Workspace, WorkspaceMember, WorkspaceMemberRole
from app.extensions import db


def clear_database():
    db.reflect()
    db.drop_all()
    db.create_all()


def add_fixtures_data(db):
    admin = User(
        email="admin@test.nl", name="Admin User", is_admin=True, is_verified=True
    )
    admin.set_password("admin")

    member = User(email="member@test.nl", name="Member User", is_verified=True)
    member.set_password("member")

    db.session.add_all([admin, member])
    db.session.flush()

    workspace = Workspace(
        name="Default Workspace", created_by=admin.id, setup_completed=True
    )
    db.session.add(workspace)
    db.session.flush()

    db.session.add_all(
        [
            WorkspaceMember(
                workspace_id=workspace.id,
                user_id=admin.id,
                role=WorkspaceMemberRole.ADMIN,
            ),
            WorkspaceMember(
                workspace_id=workspace.id,
                user_id=member.id,
                role=WorkspaceMemberRole.MEMBER,
            ),
        ]
    )
    db.session.commit()


def add_fixtures():
    app = create_app(config_object=DevConfig())
    with app.app_context():
        clear_database()
        add_fixtures_data(db)


if __name__ == "__main__":
    add_fixtures()
