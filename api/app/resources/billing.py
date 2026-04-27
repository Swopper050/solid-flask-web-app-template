import io
import os
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from flask import current_app, request, send_file
from flask_login import current_user, login_required
from flask_restx import Resource
from fpdf import FPDF, XPos, YPos

from app.config import (
    MY_SOLID_APP_API_URL,
    MY_SOLID_APP_FRONTEND_URL,
    MY_SOLID_APP_MOLLIE_API_KEY,
)
from app.db.billing import (
    FREE_TRIAL_DAYS,
    VAT_RATE,
    Invoice,
    InvoiceSchema,
    InvoiceStatus,
    SubscriptionPlan,
    SubscriptionStatus,
    WorkspaceSubscription,
    WorkspaceSubscriptionSchema,
)
from app.db.workspace import Workspace, WorkspaceMember, WorkspaceMemberRole
from app.errors import APIError, APIErrorEnum
from app.extensions import api, db

_LOGO_PATH = os.path.join(os.path.dirname(__file__), "..", "static", "logo.png")


def sync_subscription_seats(workspace_id: int) -> None:
    """Automatically sync subscription seats to match actual member count."""
    sub = WorkspaceSubscription.query.filter_by(workspace_id=workspace_id).first()
    if sub is None:
        return
    if sub.billing_exempt:
        return
    if sub.plan != SubscriptionPlan.PAID or sub.status != SubscriptionStatus.ACTIVE:
        return

    member_count = WorkspaceMember.query.filter_by(workspace_id=workspace_id).count()
    new_seats = max(member_count, 1)

    if new_seats == sub.seats:
        return

    old_seats = sub.seats
    sub.seats = new_seats

    if sub.mollie_customer_id and sub.mollie_subscription_id:
        try:
            mollie = _get_mollie_client()
            amount = sub.seat_price * new_seats
            customer = mollie.customers.get(sub.mollie_customer_id)
            customer.subscriptions.update(
                sub.mollie_subscription_id,
                {
                    "amount": {"currency": "EUR", "value": f"{amount:.2f}"},
                    "description": f"Subscription - {new_seats} seat{'s' if new_seats != 1 else ''}",
                    "metadata": {
                        "workspace_id": str(workspace_id),
                        "seats": str(new_seats),
                    },
                },
            )
        except Exception as e:
            current_app.logger.error(
                "Failed to update Mollie subscription for workspace %d: %s",
                workspace_id,
                str(e),
            )
            sub.seats = old_seats
            db.session.commit()
            return

    db.session.commit()


def _get_mollie_client():
    from mollie.api.client import Client

    client = Client()
    client.set_api_key(MY_SOLID_APP_MOLLIE_API_KEY)
    return client


def _get_workspace_and_assert_owner_or_admin(
    workspace_id: int,
) -> tuple[Workspace, WorkspaceMember]:
    workspace = Workspace.query.get(workspace_id)
    if workspace is None:
        raise APIError(APIErrorEnum.workspace_not_found, "Workspace not found", 404)

    member = WorkspaceMember.query.filter_by(
        workspace_id=workspace_id, user_id=current_user.id
    ).first()
    if member is None:
        raise APIError(
            APIErrorEnum.not_workspace_member, "Not a member of this workspace", 403
        )
    if member.role not in (WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN):
        raise APIError(
            APIErrorEnum.not_workspace_owner_or_admin,
            "This action requires owner or admin role",
            403,
        )
    return workspace, member


def get_or_create_subscription(workspace_id: int) -> WorkspaceSubscription:
    sub = WorkspaceSubscription.query.filter_by(workspace_id=workspace_id).first()
    if sub is None:
        sub = WorkspaceSubscription(
            workspace_id=workspace_id,
            plan=SubscriptionPlan.FREE_TRIAL,
            status=SubscriptionStatus.ACTIVE,
            seats=1,
        )
        db.session.add(sub)
        db.session.commit()
    return sub


def _resolve_stale_pending(sub: WorkspaceSubscription):
    """Check whether a PENDING subscription's Mollie payment is still open."""
    latest_invoice = (
        Invoice.query.filter_by(subscription_id=sub.id, status=InvoiceStatus.PENDING)
        .order_by(Invoice.created_at.desc())
        .first()
    )
    if latest_invoice is None:
        sub.status = SubscriptionStatus.ACTIVE
        sub.plan = SubscriptionPlan.FREE_TRIAL
        db.session.commit()
        return

    try:
        mollie = _get_mollie_client()
        payment = mollie.payments.get(latest_invoice.mollie_payment_id)
        mollie_status = payment["status"]
    except Exception:
        return

    if mollie_status in ("expired", "canceled", "failed"):
        latest_invoice.status = InvoiceStatus.FAILED
        sub.status = SubscriptionStatus.ACTIVE
        sub.plan = SubscriptionPlan.FREE_TRIAL
        db.session.commit()


def get_workspace_frozen_state(
    sub: WorkspaceSubscription,
) -> tuple[bool, str | None]:
    """Return (is_frozen, frozen_reason) for a workspace subscription."""
    if sub.billing_exempt:
        return False, None

    if sub.plan == SubscriptionPlan.PAID and sub.status == SubscriptionStatus.ACTIVE:
        return False, None

    if sub.plan == SubscriptionPlan.PAID and sub.status == SubscriptionStatus.CANCELLED:
        if sub.paid_until is not None:
            paid_until = sub.paid_until
            if paid_until.tzinfo is None:
                paid_until = paid_until.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) < paid_until:
                return False, None
        return True, "subscription_expired"

    if sub.plan == SubscriptionPlan.FREE_TRIAL:
        created = sub.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        elapsed = (datetime.now(timezone.utc) - created).days
        if elapsed >= FREE_TRIAL_DAYS:
            return True, "trial_expired"
        return False, None

    return False, None


def get_trial_days_remaining(sub: WorkspaceSubscription) -> int:
    """Return number of free trial days remaining (0 if expired, -1 if paid)."""
    if sub.billing_exempt:
        return -1
    if sub.is_paid:
        return -1
    if sub.plan != SubscriptionPlan.FREE_TRIAL:
        return 0
    created = sub.created_at
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    elapsed = (datetime.now(timezone.utc) - created).days
    return max(0, FREE_TRIAL_DAYS - elapsed)


def assert_workspace_not_frozen(workspace_id: int) -> None:
    """Raise APIError if the workspace is frozen (trial expired or subscription ended)."""
    sub = WorkspaceSubscription.query.filter_by(workspace_id=workspace_id).first()
    if sub is None:
        return
    is_frozen, reason = get_workspace_frozen_state(sub)
    if is_frozen:
        raise APIError(
            APIErrorEnum.workspace_frozen,
            "This workspace is frozen. Please upgrade to continue.",
            403,
        )


def _latin1(text: str) -> str:
    """Replace characters outside latin-1 with closest ASCII equivalents."""
    replacements = {
        "–": "-",
        "—": "-",
        "‘": "'",
        "’": "'",
        "“": '"',
        "”": '"',
        "…": "...",
    }
    for char, sub in replacements.items():
        text = text.replace(char, sub)
    return text.encode("latin-1", errors="replace").decode("latin-1")


def _generate_invoice_pdf(invoice: Invoice, workspace_name: str) -> bytes:
    pdf = FPDF()
    pdf.set_auto_page_break(auto=False)
    pdf.add_page()

    page_w = pdf.w
    margin = 20
    content_w = page_w - 2 * margin

    green = (28, 184, 126)
    dark = (26, 26, 46)
    gray = (107, 114, 128)
    light_gray = (156, 163, 175)
    white = (255, 255, 255)
    bg_light = (249, 250, 251)
    border_color = (229, 231, 235)
    green_bg = (240, 253, 248)
    green_border = (214, 245, 233)

    pdf.set_fill_color(*green)
    pdf.rect(0, 0, page_w, 4, "F")

    header_y = 16
    pdf.set_y(header_y)

    if os.path.exists(_LOGO_PATH):
        pdf.image(_LOGO_PATH, x=margin, y=header_y, w=14, h=14)

    pdf.set_xy(margin + 17, header_y)
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(*dark)
    pdf.cell(pdf.get_string_width("My"), 14, "My", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.set_text_color(*green)
    pdf.cell(pdf.get_string_width("App"), 14, "App", new_x=XPos.RIGHT, new_y=YPos.TOP)

    pdf.set_font("Helvetica", "B", 28)
    pdf.set_text_color(*dark)
    pdf.set_xy(page_w - margin - 60, header_y - 2)
    pdf.cell(60, 16, "INVOICE", align="R", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*gray)
    pdf.set_xy(page_w - margin - 60, header_y + 16)
    pdf.cell(
        60,
        6,
        f"#{str(invoice.id).zfill(6)}",
        align="R",
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )

    pdf.ln(10)
    y_div = pdf.get_y()
    pdf.set_draw_color(*border_color)
    pdf.set_line_width(0.3)
    pdf.line(margin, y_div, page_w - margin, y_div)
    pdf.ln(10)

    meta_y = pdf.get_y()
    col_w = content_w / 2

    pdf.set_xy(margin, meta_y)
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(*light_gray)
    pdf.cell(col_w, 5, "INVOICE DETAILS", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_xy(margin, meta_y + 8)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*gray)
    pdf.cell(28, 6, "Date:")
    pdf.set_text_color(*dark)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(
        col_w - 28,
        6,
        invoice.created_at.strftime("%B %d, %Y"),
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )

    pdf.set_xy(margin, meta_y + 16)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*gray)
    pdf.cell(28, 6, "Payment:")
    pdf.set_text_color(*dark)
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(
        col_w - 28,
        6,
        invoice.mollie_payment_id,
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )

    pdf.set_xy(margin, meta_y + 26)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*gray)
    pdf.cell(28, 6, "Status:")
    if invoice.status == InvoiceStatus.PAID:
        pdf.set_fill_color(*green_bg)
        pdf.set_draw_color(*green_border)
        pdf.set_text_color(*green)
        pdf.set_font("Helvetica", "B", 8)
        badge_x = margin + 28
        badge_y = meta_y + 26.5
        pdf.rect(badge_x, badge_y, 20, 5, "DF")
        pdf.set_xy(badge_x, badge_y)
        pdf.cell(20, 5, "PAID", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    else:
        pdf.set_text_color(220, 38, 38)
        pdf.set_font("Helvetica", "B", 8)
        pdf.cell(
            20,
            5,
            invoice.status.upper(),
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )

    pdf.set_xy(margin + col_w, meta_y)
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(*light_gray)
    pdf.cell(col_w, 5, "BILL TO", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_xy(margin + col_w, meta_y + 8)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*dark)
    pdf.cell(col_w, 6, _latin1(workspace_name), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_y(meta_y + 42)
    pdf.ln(6)
    table_y = pdf.get_y()

    hdr_h = 10
    pdf.set_fill_color(*dark)
    pdf.rect(margin, table_y, content_w, hdr_h, "F")

    pdf.set_xy(margin, table_y)
    pdf.set_font("Helvetica", "B", 8.5)
    pdf.set_text_color(*white)

    col_desc = content_w * 0.55
    col_seats = content_w * 0.15
    col_unit = content_w * 0.15
    col_amount = content_w * 0.15

    pdf.cell(col_desc, hdr_h, "  Description")
    pdf.cell(col_seats, hdr_h, "Seats", align="C")
    pdf.cell(col_unit, hdr_h, "Unit Price", align="R")
    pdf.cell(
        col_amount, hdr_h, "Amount  ", align="R", new_x=XPos.LMARGIN, new_y=YPos.NEXT
    )

    row_y = table_y + hdr_h
    row_h = 11
    pdf.set_fill_color(*bg_light)
    pdf.rect(margin, row_y, content_w, row_h, "F")

    pdf.set_draw_color(*border_color)
    pdf.set_line_width(0.2)
    pdf.line(margin, row_y + row_h, page_w - margin, row_y + row_h)

    pdf.set_xy(margin, row_y)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*dark)

    unit_price = (
        (invoice.amount / invoice.seats) if invoice.seats > 0 else invoice.amount
    )

    pdf.cell(col_desc, row_h, f"  {_latin1(invoice.description)}")
    pdf.cell(col_seats, row_h, str(invoice.seats), align="C")
    pdf.set_text_color(*gray)
    pdf.cell(col_unit, row_h, f"{invoice.currency} {unit_price:.2f}", align="R")
    pdf.set_text_color(*dark)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(
        col_amount,
        row_h,
        f"{invoice.currency} {invoice.amount:.2f}  ",
        align="R",
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )

    pdf.ln(8)
    totals_y = pdf.get_y()
    totals_x = page_w - margin - 80

    amount = invoice.amount
    vat_amount = (amount * VAT_RATE / (1 + VAT_RATE)).quantize(Decimal("0.01"))
    net_amount = amount - vat_amount

    pdf.set_xy(totals_x, totals_y)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*gray)
    pdf.cell(40, 7, "Subtotal (excl. VAT)")
    pdf.set_text_color(*dark)
    pdf.cell(
        40,
        7,
        f"{invoice.currency} {net_amount:.2f}",
        align="R",
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )

    pdf.set_xy(totals_x, totals_y + 8)
    pdf.set_text_color(*gray)
    pdf.cell(40, 7, "VAT 21%")
    pdf.set_text_color(*dark)
    pdf.cell(
        40,
        7,
        f"{invoice.currency} {vat_amount:.2f}",
        align="R",
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )

    div_y = totals_y + 17
    pdf.set_draw_color(*border_color)
    pdf.line(totals_x, div_y, page_w - margin, div_y)

    pdf.set_xy(totals_x, div_y + 3)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*dark)
    pdf.cell(40, 9, "Total (incl. VAT)")
    pdf.set_text_color(*green)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(
        40,
        9,
        f"{invoice.currency} {invoice.amount:.2f}",
        align="R",
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )

    footer_y = 272
    pdf.set_draw_color(*border_color)
    pdf.set_line_width(0.3)
    pdf.line(margin, footer_y, page_w - margin, footer_y)

    pdf.set_xy(margin, footer_y + 4)
    pdf.set_font("Helvetica", "", 7.5)
    pdf.set_text_color(*light_gray)
    pdf.cell(content_w / 2, 4, "My App", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(
        content_w / 2,
        4,
        "Thank you for your business",
        align="R",
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )

    pdf.set_xy(margin, footer_y + 9)
    pdf.cell(content_w / 2, 4, "my-app.com", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(
        content_w / 2,
        4,
        f"Invoice #{str(invoice.id).zfill(6)}",
        align="R",
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )

    return bytes(pdf.output())


@api.route("/workspaces/<int:workspace_id>/billing")
class WorkspaceBilling(Resource):
    @login_required
    def get(self, workspace_id: int):
        workspace, _ = _get_workspace_and_assert_owner_or_admin(workspace_id)
        sub = get_or_create_subscription(workspace_id)

        if sub.status == SubscriptionStatus.PENDING:
            _resolve_stale_pending(sub)

        member_count = WorkspaceMember.query.filter_by(workspace_id=workspace_id).count()

        result = WorkspaceSubscriptionSchema().dump(sub)
        result["member_count"] = member_count
        result["seat_price"] = str(sub.seat_price)
        result["billing_exempt"] = sub.billing_exempt
        result["trial_days_remaining"] = get_trial_days_remaining(sub)
        result["paid_until"] = (
            sub.paid_until.isoformat() + "Z" if sub.paid_until else None
        )

        is_frozen, frozen_reason = get_workspace_frozen_state(sub)
        result["is_frozen"] = is_frozen
        result["frozen_reason"] = frozen_reason

        result["next_invoice_date"] = None
        if (
            sub.plan == SubscriptionPlan.PAID
            and sub.mollie_customer_id
            and sub.mollie_subscription_id
        ):
            try:
                mollie = _get_mollie_client()
                customer = mollie.customers.get(sub.mollie_customer_id)
                mollie_sub = customer.subscriptions.get(sub.mollie_subscription_id)
                result["next_invoice_date"] = mollie_sub.get("nextPaymentDate")
            except Exception:
                pass

        return result


@api.route("/workspaces/<int:workspace_id>/billing/seats")
class WorkspaceBillingSeats(Resource):
    @login_required
    def patch(self, workspace_id: int):
        workspace, _ = _get_workspace_and_assert_owner_or_admin(workspace_id)
        sub = get_or_create_subscription(workspace_id)

        data = request.get_json() or {}
        seats = data.get("seats")
        if not isinstance(seats, int) or seats < 1:
            raise APIError(APIErrorEnum.billing_error, "Invalid seat count", 400)

        member_count = WorkspaceMember.query.filter_by(workspace_id=workspace_id).count()
        if seats < member_count:
            raise APIError(
                APIErrorEnum.billing_error,
                f"Seat count cannot be less than the current number of members ({member_count})",
                400,
            )

        old_seats = sub.seats
        sub.seats = seats

        if (
            sub.plan == SubscriptionPlan.PAID
            and sub.status == SubscriptionStatus.ACTIVE
            and sub.mollie_customer_id
            and sub.mollie_subscription_id
            and seats != old_seats
        ):
            try:
                mollie = _get_mollie_client()
                amount = sub.seat_price * seats
                customer = mollie.customers.get(sub.mollie_customer_id)
                customer.subscriptions.update(
                    sub.mollie_subscription_id,
                    {
                        "amount": {"currency": "EUR", "value": f"{amount:.2f}"},
                        "description": f"Subscription - {seats} seat{'s' if seats != 1 else ''}",
                        "metadata": {
                            "workspace_id": str(workspace_id),
                            "seats": str(seats),
                        },
                    },
                )
            except Exception as e:
                current_app.logger.error(
                    "Failed to update Mollie subscription for workspace %d: %s",
                    workspace_id,
                    str(e),
                )
                sub.seats = old_seats
                raise APIError(
                    APIErrorEnum.billing_error,
                    "Failed to update subscription. Please try again.",
                    502,
                )

        db.session.commit()
        result = WorkspaceSubscriptionSchema().dump(sub)
        result["seat_price"] = str(sub.seat_price)
        result["member_count"] = member_count
        return result


@api.route("/workspaces/<int:workspace_id>/billing/checkout")
class WorkspaceBillingCheckout(Resource):
    @login_required
    def post(self, workspace_id: int):
        workspace, _ = _get_workspace_and_assert_owner_or_admin(workspace_id)
        sub = get_or_create_subscription(workspace_id)

        if sub.plan == SubscriptionPlan.PAID and sub.status == SubscriptionStatus.ACTIVE:
            raise APIError(
                APIErrorEnum.billing_error,
                "Workspace already has an active subscription",
                409,
            )

        if sub.status == SubscriptionStatus.PENDING:
            _resolve_stale_pending(sub)

        if sub.status == SubscriptionStatus.PENDING:
            raise APIError(
                APIErrorEnum.billing_error,
                "A payment is already being processed. Please wait for it to complete.",
                409,
            )

        member_count = WorkspaceMember.query.filter_by(workspace_id=workspace_id).count()
        seats = max(member_count, 1)
        amount = sub.seat_price * seats

        mollie = _get_mollie_client()

        if sub.mollie_customer_id:
            try:
                customer = mollie.customers.get(sub.mollie_customer_id)
            except Exception:
                customer = None
        else:
            customer = None

        if customer is None:
            billing_email = sub.billing_email or current_user.email
            customer = mollie.customers.create(
                {
                    "name": workspace.name,
                    "email": billing_email,
                    "metadata": {"workspace_id": str(workspace_id)},
                }
            )
            sub.mollie_customer_id = customer["id"]
            db.session.commit()

        try:
            payment = mollie.payments.create(
                {
                    "amount": {"currency": "EUR", "value": f"{amount:.2f}"},
                    "customerId": sub.mollie_customer_id,
                    "sequenceType": "first",
                    "description": f"Subscription - {seats} seat{'s' if seats != 1 else ''}",
                    "redirectUrl": f"{MY_SOLID_APP_FRONTEND_URL}/dashboard?billing_status=success&workspace_id={workspace_id}",
                    "cancelUrl": f"{MY_SOLID_APP_FRONTEND_URL}/dashboard?billing_status=cancelled&workspace_id={workspace_id}",
                    "webhookUrl": f"{MY_SOLID_APP_API_URL}/billing/webhook",
                    "metadata": {
                        "workspace_id": str(workspace_id),
                        "seats": str(seats),
                    },
                }
            )
        except Exception as e:
            current_app.logger.error("Mollie payment creation failed: %s", str(e))
            raise APIError(
                APIErrorEnum.billing_error,
                "Failed to create payment. Please try again.",
                502,
            )

        existing_invoice = Invoice.query.filter_by(
            mollie_payment_id=payment["id"]
        ).first()
        if existing_invoice is None:
            invoice = Invoice(
                workspace_id=workspace_id,
                subscription_id=sub.id,
                mollie_payment_id=payment["id"],
                amount=amount,
                currency="EUR",
                status=InvoiceStatus.PENDING,
                description=f"Subscription - {seats} seat{'s' if seats != 1 else ''}",
                seats=seats,
            )
            db.session.add(invoice)

        sub.status = SubscriptionStatus.PENDING
        sub.seats = seats
        db.session.commit()

        checkout_url = payment["_links"]["checkout"]["href"]
        return {"checkout_url": checkout_url}

    @login_required
    def delete(self, workspace_id: int):
        """Cancel a pending checkout so the user can start a fresh one."""
        workspace, _ = _get_workspace_and_assert_owner_or_admin(workspace_id)
        sub = get_or_create_subscription(workspace_id)

        if sub.status != SubscriptionStatus.PENDING:
            raise APIError(
                APIErrorEnum.billing_error,
                "No pending checkout to cancel.",
                409,
            )

        latest_invoice = (
            Invoice.query.filter_by(subscription_id=sub.id, status=InvoiceStatus.PENDING)
            .order_by(Invoice.created_at.desc())
            .first()
        )

        if latest_invoice and latest_invoice.mollie_payment_id:
            try:
                mollie = _get_mollie_client()
                payment = mollie.payments.get(latest_invoice.mollie_payment_id)
                if payment["status"] == "open":
                    mollie.payments.delete(latest_invoice.mollie_payment_id)
            except Exception as e:
                current_app.logger.warning(
                    "Failed to cancel Mollie payment %s: %s",
                    latest_invoice.mollie_payment_id,
                    str(e),
                )

        if latest_invoice:
            latest_invoice.status = InvoiceStatus.FAILED

        sub.status = SubscriptionStatus.ACTIVE
        sub.plan = SubscriptionPlan.FREE_TRIAL
        db.session.commit()

        return {"status": "cancelled"}


@api.route("/workspaces/<int:workspace_id>/billing/subscription")
class WorkspaceBillingSubscription(Resource):
    @login_required
    def delete(self, workspace_id: int):
        workspace, _ = _get_workspace_and_assert_owner_or_admin(workspace_id)
        sub = WorkspaceSubscription.query.filter_by(workspace_id=workspace_id).first()

        if sub is None or sub.plan != SubscriptionPlan.PAID:
            raise APIError(
                APIErrorEnum.subscription_not_found,
                "No active paid subscription found",
                404,
            )

        next_payment_date = None
        if sub.mollie_customer_id and sub.mollie_subscription_id:
            try:
                mollie = _get_mollie_client()
                customer = mollie.customers.get(sub.mollie_customer_id)
                mollie_sub = customer.subscriptions.get(sub.mollie_subscription_id)
                next_date_str = mollie_sub.get("nextPaymentDate")
                if next_date_str:
                    next_payment_date = datetime.strptime(
                        next_date_str, "%Y-%m-%d"
                    ).replace(tzinfo=timezone.utc)
                customer.subscriptions.delete(sub.mollie_subscription_id)
            except Exception as e:
                current_app.logger.warning(
                    "Failed to cancel Mollie subscription %s: %s",
                    sub.mollie_subscription_id,
                    str(e),
                )

        sub.status = SubscriptionStatus.CANCELLED
        sub.paid_until = next_payment_date
        sub.mollie_subscription_id = None
        db.session.commit()

        return {}, 200


@api.route("/workspaces/<int:workspace_id>/billing/invoices")
class WorkspaceBillingInvoices(Resource):
    @login_required
    def get(self, workspace_id: int):
        _get_workspace_and_assert_owner_or_admin(workspace_id)

        limit = request.args.get("limit", 5, type=int)
        offset = request.args.get("offset", 0, type=int)
        limit = min(max(limit, 1), 50)
        offset = max(offset, 0)

        query = Invoice.query.filter_by(workspace_id=workspace_id).order_by(
            Invoice.created_at.desc()
        )
        total = query.count()
        invoices = query.offset(offset).limit(limit).all()

        return {
            "invoices": InvoiceSchema(many=True).dump(invoices),
            "has_more": (offset + limit) < total,
        }


@api.route("/workspaces/<int:workspace_id>/billing/invoices/<int:invoice_id>/download")
class WorkspaceBillingInvoiceDownload(Resource):
    @login_required
    def get(self, workspace_id: int, invoice_id: int):
        workspace, _ = _get_workspace_and_assert_owner_or_admin(workspace_id)

        invoice = Invoice.query.filter_by(
            id=invoice_id, workspace_id=workspace_id
        ).first()
        if invoice is None:
            raise APIError(APIErrorEnum.invoice_not_found, "Invoice not found", 404)

        if invoice.status != InvoiceStatus.PAID:
            raise APIError(
                APIErrorEnum.billing_error,
                "Invoice is not available for download",
                400,
            )

        pdf_bytes = _generate_invoice_pdf(invoice, workspace.name)
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"invoice-{invoice.id:06d}.pdf",
        )


@api.route("/workspaces/<int:workspace_id>/billing/update-payment-method")
class WorkspaceBillingUpdatePaymentMethod(Resource):
    @login_required
    def post(self, workspace_id: int):
        workspace, _ = _get_workspace_and_assert_owner_or_admin(workspace_id)
        sub = WorkspaceSubscription.query.filter_by(workspace_id=workspace_id).first()

        if sub is None or sub.status != SubscriptionStatus.ACTIVE:
            raise APIError(
                APIErrorEnum.billing_error,
                "No active subscription found",
                404,
            )

        if not sub.mollie_customer_id:
            raise APIError(
                APIErrorEnum.billing_error,
                "No payment customer on file. Please contact support.",
                400,
            )

        mollie = _get_mollie_client()

        try:
            customer = mollie.customers.get(sub.mollie_customer_id)
        except Exception:
            raise APIError(
                APIErrorEnum.billing_error,
                "Failed to retrieve payment customer. Please try again.",
                502,
            )

        try:
            payment = mollie.payments.create(
                {
                    "amount": {"currency": "EUR", "value": "0.01"},
                    "customerId": customer["id"],
                    "sequenceType": "first",
                    "description": "Update payment method",
                    "redirectUrl": f"{MY_SOLID_APP_FRONTEND_URL}/dashboard?billing_status=method_updated&workspace_id={workspace_id}",
                    "cancelUrl": f"{MY_SOLID_APP_FRONTEND_URL}/dashboard?billing_status=cancelled&workspace_id={workspace_id}",
                    "webhookUrl": f"{MY_SOLID_APP_API_URL}/billing/webhook",
                    "metadata": {
                        "workspace_id": str(workspace_id),
                        "type": "payment_method_update",
                    },
                }
            )
        except Exception as e:
            current_app.logger.error("Mollie payment method update failed: %s", str(e))
            raise APIError(
                APIErrorEnum.billing_error,
                "Failed to initiate payment method update. Please try again.",
                502,
            )

        checkout_url = payment["_links"]["checkout"]["href"]
        return {"checkout_url": checkout_url}


@api.route("/workspaces/<int:workspace_id>/billing/payment-method")
class WorkspaceBillingPaymentMethod(Resource):
    @login_required
    def get(self, workspace_id: int):
        _get_workspace_and_assert_owner_or_admin(workspace_id)
        sub = WorkspaceSubscription.query.filter_by(workspace_id=workspace_id).first()

        empty = {
            "method": None,
            "card_label": None,
            "card_last4": None,
            "card_expiry": None,
        }

        if sub is None or not sub.mollie_customer_id:
            return empty

        try:
            mollie = _get_mollie_client()
            customer = mollie.customers.get(sub.mollie_customer_id)
            mandates = customer.mandates.list()

            for mandate in mandates:
                if mandate.get("status") not in ("valid", "pending"):
                    continue

                method = mandate.get("method", "")
                details = mandate.get("details", {}) or {}

                if method == "creditcard":
                    return {
                        "method": "creditcard",
                        "card_label": details.get("cardLabel", "Card"),
                        "card_last4": details.get("cardNumber", "")[-4:]
                        if details.get("cardNumber")
                        else None,
                        "card_expiry": details.get("cardExpiryDate"),
                    }
                elif method == "directdebit":
                    return {
                        "method": "directdebit",
                        "card_label": "SEPA Direct Debit",
                        "card_last4": details.get("consumerAccount", "")[-4:]
                        if details.get("consumerAccount")
                        else None,
                        "card_expiry": None,
                    }
                else:
                    return {
                        "method": method,
                        "card_label": method.replace("_", " ").title(),
                        "card_last4": None,
                        "card_expiry": None,
                    }
        except Exception as e:
            current_app.logger.warning(
                "Failed to fetch payment methods for workspace %d: %s",
                workspace_id,
                str(e),
            )

        return empty


@api.route("/billing/webhook")
class MollieWebhook(Resource):
    def post(self):
        """Mollie webhook handler — receives payment status updates."""
        payment_id = request.form.get("id") or (request.get_json(silent=True) or {}).get(
            "id"
        )
        if not payment_id:
            return {}, 200

        try:
            mollie = _get_mollie_client()
            payment = mollie.payments.get(payment_id)
        except Exception as e:
            current_app.logger.error(
                "Mollie webhook: failed to fetch payment %s: %s", payment_id, str(e)
            )
            return {}, 200

        metadata = payment.get("metadata", {}) or {}
        workspace_id_str = metadata.get("workspace_id")
        seats_str = metadata.get("seats", "1")

        if not workspace_id_str:
            invoice = Invoice.query.filter_by(mollie_payment_id=payment_id).first()
            if invoice:
                workspace_id_str = str(invoice.workspace_id)
                seats_str = str(invoice.seats)

        if not workspace_id_str:
            current_app.logger.warning(
                "Mollie webhook: no workspace_id in metadata for payment %s", payment_id
            )
            return {}, 200

        workspace_id = int(workspace_id_str)
        payment_status = payment["status"]

        if metadata.get("type") == "payment_method_update":
            current_app.logger.info(
                "Workspace %d: payment method update %s for payment %s",
                workspace_id,
                payment_status,
                payment_id,
            )
            return {}, 200

        seats = int(seats_str)
        amount_value = payment.get("amount", {}).get("value", "0.00")
        amount = Decimal(amount_value)
        description = payment.get("description", "Subscription")

        sub = WorkspaceSubscription.query.filter_by(workspace_id=workspace_id).first()
        if sub is None:
            current_app.logger.warning(
                "Mollie webhook: no subscription for workspace %d", workspace_id
            )
            return {}, 200

        invoice = Invoice.query.filter_by(mollie_payment_id=payment_id).first()
        if invoice is None:
            invoice = Invoice(
                workspace_id=workspace_id,
                subscription_id=sub.id,
                mollie_payment_id=payment_id,
                amount=amount,
                currency=payment.get("amount", {}).get("currency", "EUR"),
                status=InvoiceStatus.PENDING,
                description=description,
                seats=seats,
            )
            db.session.add(invoice)

        if payment_status == "paid":
            invoice.status = InvoiceStatus.PAID
            sub.plan = SubscriptionPlan.PAID
            sub.status = SubscriptionStatus.ACTIVE
            sub.seats = seats
            db.session.commit()

            if payment.get("sequenceType") == "first" and not sub.mollie_subscription_id:
                _create_mollie_subscription(mollie, sub, seats, description)
                db.session.commit()

            current_app.logger.info(
                "Workspace %d: payment %s paid, subscription activated",
                workspace_id,
                payment_id,
            )

        elif payment_status in ("failed", "expired", "canceled"):
            invoice.status = InvoiceStatus.FAILED
            if sub.status == SubscriptionStatus.PENDING:
                sub.status = SubscriptionStatus.ACTIVE
                sub.plan = SubscriptionPlan.FREE_TRIAL
            current_app.logger.info(
                "Workspace %d: payment %s %s", workspace_id, payment_id, payment_status
            )
            db.session.commit()

        else:
            db.session.commit()

        return {}, 200


def _create_mollie_subscription(
    mollie, sub: WorkspaceSubscription, seats: int, description: str
):
    """Create a recurring Mollie subscription after the first payment."""
    amount = sub.seat_price * seats
    interval = sub.billing_interval or "1 month"

    if interval == "1 month":
        start_date = (date.today() + timedelta(days=32)).replace(day=1).isoformat()
    elif interval.endswith("day") or interval.endswith("days"):
        start_date = (date.today() + timedelta(days=1)).isoformat()
    elif interval.endswith("week") or interval.endswith("weeks"):
        start_date = (date.today() + timedelta(weeks=1)).isoformat()
    else:
        start_date = (date.today() + timedelta(days=32)).replace(day=1).isoformat()

    try:
        customer = mollie.customers.get(sub.mollie_customer_id)
        mollie_sub = customer.subscriptions.create(
            {
                "amount": {"currency": "EUR", "value": f"{amount:.2f}"},
                "interval": interval,
                "startDate": start_date,
                "description": description,
                "webhookUrl": f"{MY_SOLID_APP_API_URL}/billing/webhook",
                "metadata": {
                    "workspace_id": str(sub.workspace_id),
                    "seats": str(seats),
                },
            }
        )
        sub.mollie_subscription_id = mollie_sub["id"]
        current_app.logger.info(
            "Workspace %d: created Mollie subscription with interval=%s, startDate=%s",
            sub.workspace_id,
            interval,
            start_date,
        )
    except Exception as e:
        current_app.logger.error(
            "Failed to create Mollie subscription for workspace %d: %s",
            sub.workspace_id,
            str(e),
        )
        raise
