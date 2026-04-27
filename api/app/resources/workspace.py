from flask import current_app, request
from flask_login import current_user, login_required
from flask_restx import Resource
from marshmallow import Schema, fields

from app.db.user import User
from app.db.workspace import (
    WORKSPACE_LANGUAGES,
    Workspace,
    WorkspaceInvitation,
    WorkspaceInvitationSchema,
    WorkspaceListItemSchema,
    WorkspaceMember,
    WorkspaceMemberRole,
    WorkspaceSchema,
)
from app.errors import APIError, APIErrorEnum
from app.extensions import api, db
from app.resources.billing import (
    get_or_create_subscription,
    get_workspace_frozen_state,
    sync_subscription_seats,
)
from app.tasks.mail_tasks import (
    send_workspace_invitation_email,
    send_workspace_invitation_new_user_email,
)


class CreateWorkspaceSchema(Schema):
    name = fields.String(required=True)


class UpdateWorkspaceSchema(Schema):
    name = fields.String(required=True)
    color = fields.String(load_default=None, allow_none=True)
    context = fields.String(load_default=None, allow_none=True)
    language = fields.String(load_default=None, allow_none=True)


class InviteMemberSchema(Schema):
    email = fields.String(required=True)


class UpdateMemberRoleSchema(Schema):
    role = fields.String(required=True)


class AcceptInvitationSchema(Schema):
    token = fields.String(required=True)


def _get_workspace_and_assert_member(
    workspace_id: int,
) -> tuple[Workspace, WorkspaceMember]:
    workspace = db.session.get(Workspace, workspace_id)
    if workspace is None:
        raise APIError(APIErrorEnum.workspace_not_found, "Workspace not found", 404)

    member = WorkspaceMember.query.filter_by(
        workspace_id=workspace_id, user_id=current_user.id
    ).first()
    if member is None:
        raise APIError(
            APIErrorEnum.not_workspace_member, "Not a member of this workspace", 403
        )

    return workspace, member


def _assert_owner_or_admin(member: WorkspaceMember):
    if member.role not in (WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN):
        raise APIError(
            APIErrorEnum.not_workspace_owner_or_admin,
            "This action requires owner or admin role",
            403,
        )


def _serialize_workspace_list(
    workspaces_with_roles: list[tuple[Workspace, str]],
) -> list[dict]:
    result = []
    for workspace, role in workspaces_with_roles:
        item = WorkspaceListItemSchema().dump(
            {
                "id": workspace.id,
                "name": workspace.name,
                "color": workspace.color,
                "setup_completed": workspace.setup_completed,
                "role": role,
                "member_count": len(workspace.members),
            }
        )
        sub = get_or_create_subscription(workspace.id)
        is_frozen, frozen_reason = get_workspace_frozen_state(sub)
        item["is_frozen"] = is_frozen
        item["frozen_reason"] = frozen_reason
        result.append(item)
    return result


@api.route("/workspaces")
class WorkspaceList(Resource):
    @login_required
    def get(self):
        memberships = WorkspaceMember.query.filter_by(user_id=current_user.id).all()
        workspaces = [(Workspace.query.get(m.workspace_id), m.role) for m in memberships]
        return _serialize_workspace_list(workspaces)

    @login_required
    def post(self):
        data: dict = CreateWorkspaceSchema().load(request.get_json())
        name = data.get("name", "").strip()
        if not name:
            raise APIError(
                APIErrorEnum.workspace_not_found, "Workspace name is required", 400
            )

        workspace, member = _create_workspace(name, current_user.id)
        current_app.logger.info(
            "User %d created workspace '%s' (id=%d)", current_user.id, name, workspace.id
        )
        return WorkspaceSchema().dump(workspace)


def _create_workspace(name: str, owner_id: int) -> tuple[Workspace, WorkspaceMember]:
    workspace = Workspace(name=name, created_by=owner_id)
    db.session.add(workspace)
    db.session.flush()

    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=owner_id,
        role=WorkspaceMemberRole.OWNER,
    )
    db.session.add(member)
    db.session.commit()
    return workspace, member


def create_default_workspace(user: User):
    """Called during registration to auto-create a workspace."""
    name = f"{user.name}'s Workspace" if user.name else "My Workspace"
    return _create_workspace(name, user.id)


@api.route("/workspaces/<int:workspace_id>")
class WorkspaceDetail(Resource):
    @login_required
    def get(self, workspace_id: int):
        workspace, _ = _get_workspace_and_assert_member(workspace_id)
        return WorkspaceSchema().dump(workspace)

    @login_required
    def put(self, workspace_id: int):
        workspace, member = _get_workspace_and_assert_member(workspace_id)
        _assert_owner_or_admin(member)

        data: dict = UpdateWorkspaceSchema().load(request.get_json())
        name = data.get("name", "").strip()
        if not name:
            raise APIError(
                APIErrorEnum.workspace_not_found, "Workspace name is required", 400
            )

        workspace.name = name
        if "color" in data:
            workspace.color = data["color"]
        if "context" in data:
            workspace.context = data["context"]
        if data.get("language"):
            language = data["language"]
            if language not in WORKSPACE_LANGUAGES:
                raise APIError(
                    APIErrorEnum.unknown_error,
                    f"Language must be one of {list(WORKSPACE_LANGUAGES)}",
                    400,
                )
            workspace.language = language
        db.session.add(workspace)
        db.session.commit()
        return WorkspaceSchema().dump(workspace)

    @login_required
    def delete(self, workspace_id: int):
        workspace, member = _get_workspace_and_assert_member(workspace_id)
        if member.role != WorkspaceMemberRole.OWNER:
            raise APIError(
                APIErrorEnum.not_workspace_owner_or_admin,
                "Only the owner can delete a workspace",
                403,
            )
        db.session.delete(workspace)
        db.session.commit()
        return {}, 200


@api.route("/workspaces/<int:workspace_id>/members/<int:user_id>")
class WorkspaceMemberDetail(Resource):
    @login_required
    def patch(self, workspace_id: int, user_id: int):
        workspace, member = _get_workspace_and_assert_member(workspace_id)
        _assert_owner_or_admin(member)

        data: dict = UpdateMemberRoleSchema().load(request.get_json())
        new_role = data["role"]
        if new_role not in (WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.MEMBER):
            raise APIError(
                APIErrorEnum.unknown_error,
                "Role must be 'admin' or 'member'",
                400,
            )

        target = WorkspaceMember.query.filter_by(
            workspace_id=workspace_id, user_id=user_id
        ).first()
        if target is None:
            raise APIError(APIErrorEnum.not_workspace_member, "Member not found", 404)

        if target.role in (WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN):
            admin_owner_count = WorkspaceMember.query.filter(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.role.in_(
                    [WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN]
                ),
            ).count()
            if admin_owner_count <= 1:
                raise APIError(
                    APIErrorEnum.cannot_leave_last_owner,
                    "You are the last admin. Promote someone else before changing your role.",
                    400,
                )
        elif target.user_id == current_user.id:
            raise APIError(
                APIErrorEnum.unknown_error,
                "Cannot change your own role",
                400,
            )

        target.role = new_role
        db.session.commit()
        return {}, 200

    @login_required
    def delete(self, workspace_id: int, user_id: int):
        workspace, member = _get_workspace_and_assert_member(workspace_id)

        if user_id != current_user.id:
            _assert_owner_or_admin(member)

        target = WorkspaceMember.query.filter_by(
            workspace_id=workspace_id, user_id=user_id
        ).first()
        if target is None:
            raise APIError(APIErrorEnum.not_workspace_member, "Member not found", 404)

        if target.role in (WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN):
            admin_owner_count = WorkspaceMember.query.filter(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.role.in_(
                    [WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN]
                ),
            ).count()
            if admin_owner_count <= 1:
                raise APIError(
                    APIErrorEnum.cannot_leave_last_owner,
                    "You are the last admin. Promote someone else before leaving.",
                    400,
                )

        db.session.delete(target)
        db.session.commit()

        sync_subscription_seats(workspace_id)

        return {}, 200


@api.route("/workspaces/<int:workspace_id>/invitations")
class WorkspaceInvitationList(Resource):
    @login_required
    def get(self, workspace_id: int):
        workspace, member = _get_workspace_and_assert_member(workspace_id)
        _assert_owner_or_admin(member)

        pending = WorkspaceInvitation.query.filter_by(
            workspace_id=workspace_id, accepted=False
        ).all()
        return WorkspaceInvitationSchema(many=True).dump(pending)

    @login_required
    def post(self, workspace_id: int):
        workspace, member = _get_workspace_and_assert_member(workspace_id)
        _assert_owner_or_admin(member)

        data: dict = InviteMemberSchema().load(request.get_json())
        email = data.get("email", "").strip().lower()

        invited_user = User.query.filter_by(email=email).first()
        if invited_user:
            existing = WorkspaceMember.query.filter_by(
                workspace_id=workspace_id, user_id=invited_user.id
            ).first()
            if existing:
                raise APIError(
                    APIErrorEnum.already_workspace_member,
                    "This user is already a member",
                    409,
                )

        existing_inv = WorkspaceInvitation.query.filter_by(
            workspace_id=workspace_id, email=email, accepted=False
        ).first()
        if existing_inv:
            token = existing_inv.set_token()
        else:
            existing_inv = WorkspaceInvitation(
                workspace_id=workspace_id,
                email=email,
                invited_by=current_user.id,
            )
            token = existing_inv.set_token()
            db.session.add(existing_inv)

        db.session.commit()

        if invited_user is not None:
            send_workspace_invitation_email.delay(
                receiver=email,
                workspace_id=workspace.id,
                workspace_name=workspace.name,
                inviter_name=current_user.name or current_user.email,
                invitation_token=token,
            )
        else:
            send_workspace_invitation_new_user_email.delay(
                receiver=email,
                workspace_id=workspace.id,
                workspace_name=workspace.name,
                inviter_name=current_user.name or current_user.email,
                invitation_token=token,
            )

        current_app.logger.info(
            "User %d invited %s to workspace %d", current_user.id, email, workspace_id
        )
        return WorkspaceInvitationSchema().dump(existing_inv)


@api.route("/workspaces/<int:workspace_id>/invitations/<int:invitation_id>")
class WorkspaceInvitationDetail(Resource):
    @login_required
    def delete(self, workspace_id: int, invitation_id: int):
        _, member = _get_workspace_and_assert_member(workspace_id)
        _assert_owner_or_admin(member)

        invitation = WorkspaceInvitation.query.filter_by(
            id=invitation_id, workspace_id=workspace_id
        ).first()
        if invitation is None:
            raise APIError(
                APIErrorEnum.invitation_not_found, "Invitation not found", 404
            )

        db.session.delete(invitation)
        db.session.commit()
        return {}, 200


@api.route("/invitations/lookup")
class InvitationLookup(Resource):
    def post(self):
        data: dict = AcceptInvitationSchema().load(request.get_json())
        token = data.get("token")

        invitations = WorkspaceInvitation.query.filter_by(accepted=False).all()
        matched = next((inv for inv in invitations if inv.check_token(token)), None)
        if matched is None:
            raise APIError(
                APIErrorEnum.invitation_not_found,
                "Invitation not found or already accepted",
                404,
            )

        workspace = Workspace.query.get(matched.workspace_id)
        return {
            "email": matched.email,
            "workspace_name": workspace.name if workspace else "",
        }


@api.route("/invitations/accept")
class AcceptInvitation(Resource):
    @login_required
    def post(self):
        data: dict = AcceptInvitationSchema().load(request.get_json())
        token = data.get("token")

        invitations = WorkspaceInvitation.query.filter_by(
            email=current_user.email.lower(), accepted=False
        ).all()

        matched = next((inv for inv in invitations if inv.check_token(token)), None)
        if matched is None:
            raise APIError(
                APIErrorEnum.invitation_not_found,
                "Invitation not found or already accepted",
                404,
            )

        existing = WorkspaceMember.query.filter_by(
            workspace_id=matched.workspace_id, user_id=current_user.id
        ).first()
        joined_now = existing is None
        if joined_now:
            new_member = WorkspaceMember(
                workspace_id=matched.workspace_id,
                user_id=current_user.id,
                role=WorkspaceMemberRole.MEMBER,
            )
            db.session.add(new_member)

        matched.accepted = True
        db.session.commit()

        sync_subscription_seats(matched.workspace_id)

        workspace = Workspace.query.get(matched.workspace_id)
        return WorkspaceSchema().dump(workspace)
