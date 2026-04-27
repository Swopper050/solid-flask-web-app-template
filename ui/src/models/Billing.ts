export type SubscriptionPlan = 'free_trial' | 'paid'
export type SubscriptionStatus = 'active' | 'pending' | 'past_due' | 'cancelled'
export type InvoiceStatus = 'paid' | 'pending' | 'failed'

export type FrozenReason = 'trial_expired' | 'subscription_expired' | null

export interface BillingStatusAttributes {
  id: number
  workspace_id: number
  plan: SubscriptionPlan
  status: SubscriptionStatus
  seats: number
  billing_email: string | null
  billing_exempt: boolean
  billing_interval: string | null
  monthly_amount: string
  seat_price: string
  created_at: string
  updated_at: string
  member_count: number
  next_invoice_date: string | null
  trial_days_remaining: number
  paid_until: string | null
  is_frozen: boolean
  frozen_reason: FrozenReason
}

export interface PaymentMethodAttributes {
  method: 'creditcard' | 'directdebit' | null
  card_label: string | null
  card_last4: string | null
  card_expiry: string | null
}

export interface PaginatedInvoices {
  invoices: InvoiceAttributes[]
  has_more: boolean
}

export interface InvoiceAttributes {
  id: number
  workspace_id: number
  subscription_id: number
  mollie_payment_id: string
  amount: string
  currency: string
  status: InvoiceStatus
  description: string
  seats: number
  created_at: string
}
