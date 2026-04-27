from datetime import datetime, timezone
from decimal import Decimal

from marshmallow import Schema, fields
from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.fields import UTCDateTime
from app.extensions import db


class SubscriptionPlan:
    FREE_TRIAL = "free_trial"
    PAID = "paid"


class SubscriptionStatus:
    ACTIVE = "active"
    PENDING = "pending"
    PAST_DUE = "past_due"
    CANCELLED = "cancelled"


FREE_TRIAL_DAYS = 30
SEAT_PRICE_EUR = Decimal("9.99")
VAT_RATE = Decimal("0.21")


class WorkspaceSubscription(db.Model):
    __tablename__ = "workspace_subscription"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("workspace.id", ondelete="CASCADE"), unique=True
    )
    plan: Mapped[str] = mapped_column(
        String(20), default=SubscriptionPlan.FREE_TRIAL, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), default=SubscriptionStatus.ACTIVE, nullable=False
    )
    mollie_customer_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    mollie_subscription_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    seats: Mapped[int] = mapped_column(default=1, nullable=False)
    billing_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    billing_exempt: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    billing_interval: Mapped[str | None] = mapped_column(String(20), nullable=True)
    billing_price_override: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )
    paid_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )

    workspace: Mapped["db.Model"] = relationship("Workspace")
    invoices: Mapped[list["Invoice"]] = relationship(
        "Invoice", back_populates="subscription", cascade="all, delete-orphan"
    )

    @property
    def is_paid(self) -> bool:
        if self.billing_exempt:
            return True
        if (
            self.plan == SubscriptionPlan.PAID
            and self.status == SubscriptionStatus.ACTIVE
        ):
            return True
        if (
            self.plan == SubscriptionPlan.PAID
            and self.status == SubscriptionStatus.CANCELLED
            and self.paid_until is not None
        ):
            paid_until = self.paid_until
            if paid_until.tzinfo is None:
                paid_until = paid_until.replace(tzinfo=timezone.utc)
            return datetime.now(timezone.utc) < paid_until
        return False

    @property
    def seat_price(self) -> Decimal:
        if self.billing_price_override is not None:
            return self.billing_price_override
        return SEAT_PRICE_EUR

    @property
    def monthly_amount(self) -> Decimal:
        if self.plan == SubscriptionPlan.PAID:
            return self.seat_price * self.seats
        return Decimal("0.00")


class InvoiceStatus:
    PAID = "paid"
    PENDING = "pending"
    FAILED = "failed"


class Invoice(db.Model):
    __tablename__ = "invoice"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("workspace.id", ondelete="CASCADE"), nullable=False
    )
    subscription_id: Mapped[int] = mapped_column(
        ForeignKey("workspace_subscription.id", ondelete="CASCADE"), nullable=False
    )
    mollie_payment_id: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="EUR", nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    seats: Mapped[int] = mapped_column(default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    subscription: Mapped["WorkspaceSubscription"] = relationship(
        "WorkspaceSubscription", back_populates="invoices"
    )


class WorkspaceSubscriptionSchema(Schema):
    id = fields.Integer()
    workspace_id = fields.Integer()
    plan = fields.String()
    status = fields.String()
    seats = fields.Integer()
    billing_email = fields.String(allow_none=True)
    billing_exempt = fields.Boolean()
    billing_interval = fields.String(allow_none=True)
    billing_price_override = fields.Decimal(as_string=True, allow_none=True)
    monthly_amount = fields.Method("get_monthly_amount")
    created_at = UTCDateTime()
    updated_at = UTCDateTime()

    def get_monthly_amount(self, obj: WorkspaceSubscription) -> str:
        return str(obj.monthly_amount)


class InvoiceSchema(Schema):
    id = fields.Integer()
    workspace_id = fields.Integer()
    subscription_id = fields.Integer()
    mollie_payment_id = fields.String()
    amount = fields.Decimal(as_string=True)
    currency = fields.String()
    status = fields.String()
    description = fields.String()
    seats = fields.Integer()
    created_at = UTCDateTime()
