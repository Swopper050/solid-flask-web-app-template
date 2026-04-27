import {
  createResource,
  createSignal,
  createMemo,
  For,
  JSXElement,
  Show,
} from 'solid-js'

import {
  getBillingStatus,
  getInvoices,
  getInvoiceDownloadUrl,
  getPaymentMethod,
  startBillingCheckout,
  updatePaymentMethod,
  cancelCheckout,
  cancelSubscription,
  getErrorMessage,
  ErrorData,
} from '../../api'
import { useLocale } from '../../context/LocaleProvider'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { InvoiceAttributes } from '../../models/Billing'

export function BillingTabContent(props: {
  workspaceId: number
  statusMessage?: 'success' | 'cancelled' | 'method_updated' | null
}): JSXElement {
  const { t } = useLocale()

  const [checkingOut, setCheckingOut] = createSignal(false)
  const [cancellingCheckout, setCancellingCheckout] = createSignal(false)
  const [cancelling, setCancelling] = createSignal(false)
  const [cancelModalOpen, setCancelModalOpen] = createSignal(false)
  const [checkoutError, setCheckoutError] = createSignal<string | null>(null)

  const [loadedInvoices, setLoadedInvoices] = createSignal<InvoiceAttributes[]>(
    []
  )
  const [hasMoreInvoices, setHasMoreInvoices] = createSignal(false)
  const [loadingMore, setLoadingMore] = createSignal(false)

  const workspaceId = () => props.workspaceId

  const [billing, { refetch: refetchBilling }] = createResource(
    workspaceId,
    (id) => (id ? getBillingStatus(id) : null)
  )

  const isExempt = () => billing()?.billing_exempt === true

  const isPaid = () =>
    isExempt() || (billing()?.plan === 'paid' && billing()?.status === 'active')

  const isPending = () => !isExempt() && billing()?.status === 'pending'

  const [paymentMethod] = createResource(
    () => (isPaid() && !isExempt() ? workspaceId() : null),
    (id) => (id ? getPaymentMethod(id) : null)
  )

  createResource(
    () => (isPaid() && !isExempt() ? workspaceId() : null),
    async (id) => {
      if (!id) return null
      const result = await getInvoices(id, 5, 0)
      setLoadedInvoices(result.invoices)
      setHasMoreInvoices(result.has_more)
      return result
    }
  )

  const seatPrice = createMemo(() =>
    parseFloat(billing()?.seat_price ?? '9.99')
  )
  const total = createMemo(() => {
    const b = billing()
    if (!b) return '0.00'
    return (b.member_count * seatPrice()).toFixed(2)
  })

  const handleUpgrade = async () => {
    const id = workspaceId()
    if (!id) return
    setCheckoutError(null)
    setCheckingOut(true)
    try {
      const { checkout_url } = await startBillingCheckout(id)
      window.location.href = checkout_url
    } catch (err: unknown) {
      const error = err as ErrorData
      if (error?.error !== undefined) {
        setCheckoutError(t(getErrorMessage(error)))
      } else {
        setCheckoutError(t('billing_error'))
      }
      setCheckingOut(false)
    }
  }

  const handleCancelCheckout = async () => {
    const id = workspaceId()
    if (!id) return
    setCheckoutError(null)
    setCancellingCheckout(true)
    try {
      await cancelCheckout(id)
      refetchBilling()
    } catch (err: unknown) {
      const error = err as ErrorData
      if (error?.error !== undefined) {
        setCheckoutError(t(getErrorMessage(error)))
      } else {
        setCheckoutError(t('billing_error'))
      }
    } finally {
      setCancellingCheckout(false)
    }
  }

  const [editingPayment, setEditingPayment] = createSignal(false)

  const handleEditPaymentMethod = async () => {
    const id = workspaceId()
    if (!id) return
    setCheckoutError(null)
    setEditingPayment(true)
    try {
      const { checkout_url } = await updatePaymentMethod(id)
      window.location.href = checkout_url
    } catch (err: unknown) {
      const error = err as ErrorData
      if (error?.error !== undefined) {
        setCheckoutError(t(getErrorMessage(error)))
      } else {
        setCheckoutError(t('billing_error'))
      }
      setEditingPayment(false)
    }
  }

  const handleCancelConfirm = async () => {
    const id = workspaceId()
    if (!id) return
    setCancelling(true)
    await cancelSubscription(id)
    setCancelling(false)
    setCancelModalOpen(false)
    refetchBilling()
  }

  const handleLoadMore = async () => {
    const id = workspaceId()
    if (!id || loadingMore()) return
    setLoadingMore(true)
    try {
      const result = await getInvoices(id, 5, loadedInvoices().length)
      setLoadedInvoices((prev) => [...prev, ...result.invoices])
      setHasMoreInvoices(result.has_more)
    } finally {
      setLoadingMore(false)
    }
  }

  const nextInvoiceLabel = createMemo(() => {
    const d = billing()?.next_invoice_date
    if (!d) return '—'
    const date = new Date(d)
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
  })

  return (
    <div class="flex-1 overflow-y-auto px-5 md:px-7 py-4 md:py-5">
      {/* Payment status banners */}
      <Show when={props.statusMessage === 'success'}>
        <div class="alert bg-primary/10 text-primary border-primary/20 mb-4">
          <i class="fa-solid fa-circle-check" />
          <span>{t('billing_payment_success')}</span>
        </div>
      </Show>
      <Show when={props.statusMessage === 'cancelled'}>
        <div class="flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium bg-warning/10 border-warning/20 text-warning mb-4">
          <i class="fa-solid fa-circle-exclamation text-xs" />
          <span>{t('billing_payment_cancelled')}</span>
        </div>
      </Show>
      <Show when={props.statusMessage === 'method_updated'}>
        <div class="alert bg-primary/10 text-primary border-primary/20 mb-4">
          <i class="fa-solid fa-circle-check" />
          <span>{t('billing_payment_method_updated')}</span>
        </div>
      </Show>

      <Show
        when={!billing.loading}
        fallback={
          <div class="space-y-4">
            <div class="skeleton h-32 w-full rounded-xl" />
            <div class="skeleton h-24 w-full rounded-xl" />
          </div>
        }
      >
        <Show when={billing()}>
          {(b) => (
            <div class="space-y-5">
              {/* ── PENDING VIEW ── */}
              <Show when={isPending()}>
                <div class="flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium bg-info/10 border-info/20 text-info">
                  <i class="fa-solid fa-circle-info text-xs" />
                  <span>{t('billing_payment_pending')}</span>
                </div>
                <div class="flex gap-2">
                  <Button
                    label={t('cancel_checkout')}
                    icon="fa-solid fa-xmark"
                    variant="ghost"
                    onClick={handleCancelCheckout}
                    isLoading={cancellingCheckout()}
                  />
                  <Button
                    label={t('retry_checkout')}
                    icon="fa-solid fa-arrow-right"
                    color="primary"
                    onClick={handleUpgrade}
                    isLoading={checkingOut()}
                  />
                </div>
              </Show>

              {/* ── FREE TRIAL VIEW ── */}
              <Show when={!isPaid() && !isPending()}>
                {/* Free trial plan card */}
                <div class="bg-success/5 border border-success/20 rounded-xl p-5">
                  <p class="font-bold text-sm">{t('billing_pro_trial')}</p>
                  <p class="text-xs text-base-content/60 mt-1">
                    {t('billing_pro_trial_subtitle')}
                  </p>

                  <div class="grid grid-cols-3 gap-2.5 mt-4">
                    <div class="bg-white/70 dark:bg-base-100/50 rounded-lg p-3 text-center">
                      <p
                        class={`font-extrabold text-lg ${b().trial_days_remaining === 0 ? 'text-error' : b().trial_days_remaining <= 7 ? 'text-warning' : ''}`}
                      >
                        {b().trial_days_remaining}
                      </p>
                      <p class="text-[11px] font-semibold text-success/80">
                        {t('billing_trial_days_left')}
                      </p>
                    </div>
                    <div class="bg-white/70 dark:bg-base-100/50 rounded-lg p-3 text-center">
                      <p class="font-extrabold text-lg text-success">
                        <i class="fa-solid fa-check" />
                      </p>
                      <p class="text-[11px] font-semibold text-success/80">
                        {t('billing_all_features_included')}
                      </p>
                    </div>
                    <div class="bg-white/70 dark:bg-base-100/50 rounded-lg p-3 text-center">
                      <p class="font-extrabold text-lg text-success">
                        <i class="fa-solid fa-check" />
                      </p>
                      <p class="text-[11px] font-semibold text-success/80">
                        {t('billing_no_limits')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upgrade CTA card */}
                <div class="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                  <p class="font-bold text-sm">
                    {t('billing_founding_user_title')}
                  </p>
                  <p class="text-xs text-base-content/60 mt-1">
                    <strong class="text-primary text-[15px]">
                      €{seatPrice().toFixed(2)}
                    </strong>{' '}
                    {t('billing_per_user_month')}
                  </p>

                  <Show when={checkoutError()}>
                    <div class="flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium bg-error/10 border-error/20 text-error mt-3">
                      <i class="fa-solid fa-circle-xmark text-xs" />
                      <span>{checkoutError()}</span>
                    </div>
                  </Show>

                  <div class="mt-4">
                    <Button
                      label={t('billing_upgrade_now')}
                      color="primary"
                      onClick={handleUpgrade}
                      isLoading={checkingOut()}
                    />
                  </div>
                </div>
              </Show>

              {/* ── PRO VIEW ── */}
              <Show when={isPaid() && !isExempt()}>
                {/* Plan card */}
                <div class="bg-success/5 border border-success/20 rounded-xl p-5">
                  <div class="flex items-start justify-between">
                    <p class="font-bold text-sm">{t('billing_pro_plan')}</p>
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success bg-success/15 px-2.5 py-1 rounded-full">
                      <i class="fa-solid fa-star text-[8px]" />
                      Pro
                    </span>
                  </div>
                  <p class="text-xs text-success/80 mt-1">
                    €{seatPrice().toFixed(2)} {t('billing_per_user_month')}
                  </p>

                  <div class="grid grid-cols-3 gap-2.5 mt-4">
                    <div class="bg-white/70 dark:bg-base-100/50 rounded-lg p-3 text-center">
                      <p class="font-extrabold text-lg">{b().member_count}</p>
                      <p class="text-[11px] font-semibold text-success/80">
                        {t('members')}
                      </p>
                    </div>
                    <div class="bg-white/70 dark:bg-base-100/50 rounded-lg p-3 text-center">
                      <p class="font-extrabold text-lg">€{total()}</p>
                      <p class="text-[11px] font-semibold text-success/80">
                        {t('billing_per_month')}
                      </p>
                    </div>
                    <div class="bg-white/70 dark:bg-base-100/50 rounded-lg p-3 text-center">
                      <p class="font-extrabold text-lg">{nextInvoiceLabel()}</p>
                      <p class="text-[11px] font-semibold text-success/80">
                        {t('billing_next_invoice')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment method section */}
                <div>
                  <p class="text-[13px] font-bold mb-3">
                    {t('billing_payment_method')}
                  </p>
                  <Show
                    when={paymentMethod() && paymentMethod()!.method !== null}
                    fallback={
                      <div class="flex items-center gap-3 bg-base-100 border border-base-300 rounded-xl p-3">
                        <div class="w-9 h-7 rounded-md bg-base-300 flex items-center justify-center flex-shrink-0">
                          <i class="fa-solid fa-credit-card text-xs text-base-content/40" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-semibold">
                            {t('billing_no_payment_method')}
                          </p>
                          <p class="text-[11px] text-base-content/50">
                            {t('billing_no_payment_method_hint')}
                          </p>
                        </div>
                        <Button
                          label={t('billing_add')}
                          variant="outline"
                          color="primary"
                          size="sm"
                          onClick={handleUpgrade}
                          isLoading={checkingOut()}
                        />
                      </div>
                    }
                  >
                    <div class="flex items-center gap-3 bg-base-100 border border-base-300 rounded-xl p-3">
                      <div class="w-9 h-7 rounded-md bg-gradient-to-br from-base-content/80 to-base-content/50 flex items-center justify-center flex-shrink-0">
                        <i
                          class={`fa-solid ${paymentMethod()?.method === 'directdebit' ? 'fa-building-columns' : 'fa-credit-card'} text-xs text-white`}
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold">
                          {paymentMethod()?.card_label} ····{' '}
                          {paymentMethod()?.card_last4}
                        </p>
                        <Show when={paymentMethod()?.card_expiry}>
                          <p class="text-[11px] text-base-content/50">
                            {t('billing_card_expires')}{' '}
                            {paymentMethod()?.card_expiry}
                          </p>
                        </Show>
                      </div>
                      <button
                        class="text-xs font-semibold text-primary border border-primary/20 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors"
                        onClick={handleEditPaymentMethod}
                        disabled={editingPayment()}
                      >
                        {editingPayment() ? '...' : t('billing_edit')}
                      </button>
                    </div>
                  </Show>
                </div>

                <div class="border-t border-base-300" />

                {/* Recent invoices */}
                <div>
                  <p class="text-[13px] font-bold mb-3">
                    {t('billing_recent_invoices')}
                  </p>
                  <Show
                    when={loadedInvoices().length > 0}
                    fallback={
                      <p class="text-xs text-base-content/40">
                        {t('no_invoices_yet')}
                      </p>
                    }
                  >
                    <div class="border border-base-300 rounded-xl overflow-hidden">
                      <For each={loadedInvoices()}>
                        {(invoice) => (
                          <InvoiceRow
                            invoice={invoice}
                            workspaceId={workspaceId()}
                          />
                        )}
                      </For>
                    </div>
                    <Show when={hasMoreInvoices()}>
                      <button
                        class="flex items-center justify-center gap-1.5 w-full mt-2 py-2.5 border border-dashed border-base-300 rounded-xl text-xs font-semibold text-base-content/40 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                        onClick={handleLoadMore}
                        disabled={loadingMore()}
                      >
                        <i class="fa-solid fa-chevron-down text-[10px]" />
                        {t('billing_load_more')}
                      </button>
                    </Show>
                  </Show>
                </div>

                {/* Cancel subscription */}
                <button
                  class="flex items-center gap-1.5 text-xs text-base-content/40 hover:text-error transition-colors mt-3"
                  onClick={() => setCancelModalOpen(true)}
                >
                  <i class="fa-solid fa-circle-xmark text-[10px]" />
                  {t('cancel_subscription')}
                </button>
              </Show>

              {/* ── EXEMPT VIEW ── */}
              <Show when={isExempt()}>
                <div class="bg-success/5 border border-success/20 rounded-xl p-5">
                  <div class="flex items-start justify-between">
                    <p class="font-bold text-sm">{t('billing_pro_plan')}</p>
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success bg-success/15 px-2.5 py-1 rounded-full">
                      <i class="fa-solid fa-star text-[8px]" />
                      Pro
                    </span>
                  </div>
                  <p class="text-xs text-success/80 mt-1">
                    {t('billing_exempt_description')}
                  </p>

                  <div class="grid grid-cols-3 gap-2.5 mt-4">
                    <div class="bg-white/70 dark:bg-base-100/50 rounded-lg p-3 text-center">
                      <p class="font-extrabold text-lg">{b().member_count}</p>
                      <p class="text-[11px] font-semibold text-success/80">
                        {t('members')}
                      </p>
                    </div>
                    <div class="bg-white/70 dark:bg-base-100/50 rounded-lg p-3 text-center">
                      <p class="font-extrabold text-lg">—</p>
                      <p class="text-[11px] font-semibold text-success/80">
                        {t('billing_per_month')}
                      </p>
                    </div>
                    <div class="bg-white/70 dark:bg-base-100/50 rounded-lg p-3 text-center">
                      <p class="font-extrabold text-lg">—</p>
                      <p class="text-[11px] font-semibold text-success/80">
                        {t('billing_next_invoice')}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex items-start gap-2.5 p-4 bg-success/5 border border-success/20 rounded-xl">
                  <i class="fa-solid fa-circle-info text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p class="text-[13px] font-semibold text-success">
                      {t('billing_exempt_notice_title')}
                    </p>
                    <p class="text-xs text-base-content/50 mt-0.5 leading-relaxed">
                      {t('billing_exempt_notice_body')}
                    </p>
                  </div>
                </div>
              </Show>
            </div>
          )}
        </Show>
      </Show>

      {/* Cancel subscription modal */}
      <Modal
        isOpen={cancelModalOpen()}
        onClose={() => setCancelModalOpen(false)}
        title={t('cancel_subscription')}
      >
        <p class="text-sm text-base-content/70 mb-4">
          {t('cancel_subscription_confirmation')}
        </p>
        <div class="flex gap-2 justify-end">
          <Button
            label={t('cancel')}
            onClick={() => setCancelModalOpen(false)}
            variant="ghost"
          />
          <Button
            label={t('yes_cancel_subscription')}
            color="error"
            onClick={handleCancelConfirm}
            isLoading={cancelling()}
          />
        </div>
      </Modal>
    </div>
  )
}

function InvoiceRow(props: {
  invoice: InvoiceAttributes
  workspaceId: number
}): JSXElement {
  const date = () =>
    new Date(props.invoice.created_at).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <div class="grid grid-cols-[1fr_90px_60px] gap-3 items-center px-3.5 py-2.5 border-b border-base-200 last:border-b-0 hover:bg-base-200/30 transition-colors">
      <p class="text-xs font-medium">{date()}</p>
      <p class="text-xs font-semibold text-right">
        €{parseFloat(props.invoice.amount).toFixed(2)}
      </p>
      <div class="flex items-center gap-2 justify-end">
        <span
          class={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            props.invoice.status === 'paid'
              ? 'bg-success/10 text-success'
              : props.invoice.status === 'failed'
                ? 'bg-error/10 text-error'
                : 'bg-warning/10 text-warning'
          }`}
        >
          {props.invoice.status === 'paid'
            ? 'Paid'
            : props.invoice.status === 'failed'
              ? 'Failed'
              : 'Pending'}
        </span>
        <Show when={props.invoice.status === 'paid'}>
          <a
            href={getInvoiceDownloadUrl(props.workspaceId, props.invoice.id)}
            target="_blank"
            rel="noopener noreferrer"
            class="text-base-content/40 hover:text-primary transition-colors"
            title="Download"
          >
            <i class="fa-solid fa-download text-xs" />
          </a>
        </Show>
      </div>
    </div>
  )
}
