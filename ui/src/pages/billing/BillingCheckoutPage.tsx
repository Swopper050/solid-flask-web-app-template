import {
  createResource,
  createSignal,
  createMemo,
  JSXElement,
  Show,
} from 'solid-js'
import { useNavigate, useSearchParams } from '@solidjs/router'

import {
  getBillingStatus,
  startBillingCheckout,
  getErrorMessage,
  ErrorData,
} from '../../api'
import { useLocale } from '../../context/LocaleProvider'
import { useWorkspace } from '../../context/WorkspaceProvider'

type CheckoutStep = 1 | 2 | 3

export function BillingCheckoutPage(): JSXElement {
  const { t } = useLocale()
  const navigate = useNavigate()
  const { currentWorkspace } = useWorkspace()
  const [searchParams] = useSearchParams()

  const workspaceId = () => currentWorkspace()?.id ?? 0

  const initialStep = (): CheckoutStep =>
    searchParams.status === 'success' ? 3 : 1

  const [step, setStep] = createSignal<CheckoutStep>(initialStep())
  const [checkingOut, setCheckingOut] = createSignal(false)
  const [checkoutError, setCheckoutError] = createSignal<string | null>(null)
  const [selectedMethod, setSelectedMethod] = createSignal<
    'creditcard' | 'ideal' | 'sepa'
  >('creditcard')

  const [billing] = createResource(workspaceId, (id) =>
    id ? getBillingStatus(id) : null
  )

  const seatPrice = createMemo(() =>
    parseFloat(billing()?.seat_price ?? '9.99')
  )
  const memberCount = createMemo(() => billing()?.member_count ?? 1)
  const total = createMemo(() => (memberCount() * seatPrice()).toFixed(2))

  const handleCheckout = async () => {
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

  return (
    <div class="min-h-screen bg-base-100">
      {/* Header */}
      <div class="bg-base-100 border-b border-base-300 h-16 flex items-center justify-between px-8 sticky top-0 z-50">
        <button
          class="flex items-center gap-2 text-sm text-base-content/50 hover:text-base-content transition-colors"
          onClick={() => navigate('/home')}
        >
          <i class="fa-solid fa-arrow-left text-xs" />
          {t('back')}
        </button>
        <div class="flex items-center gap-2 bg-base-200 border border-base-300 rounded-lg px-3 py-1.5 text-sm font-semibold">
          <i class="fa-solid fa-building text-primary text-xs" />
          <span class="max-w-[180px] truncate">{currentWorkspace()?.name}</span>
        </div>
        <div class="flex items-center gap-1.5 text-sm text-base-content/50">
          <i class="fa-solid fa-lock text-xs" />
          <span class="hidden sm:inline">Secure checkout</span>
        </div>
      </div>

      {/* Progress bar */}
      <div class="flex items-center justify-center gap-0 pt-8 max-w-md mx-auto">
        <StepIndicator
          num={1}
          label={t('billing_checkout_step_plan')}
          active={step() === 1}
          done={step() > 1}
        />
        <div
          class={`w-12 h-0.5 mx-3 ${step() >= 2 ? 'bg-primary' : 'bg-base-300'}`}
        />
        <StepIndicator
          num={2}
          label={t('billing_checkout_step_payment')}
          active={step() === 2}
          done={step() > 2}
        />
        <div
          class={`w-12 h-0.5 mx-3 ${step() >= 3 ? 'bg-primary' : 'bg-base-300'}`}
        />
        <StepIndicator
          num={3}
          label={t('billing_checkout_step_confirmation')}
          active={step() === 3}
          done={false}
        />
      </div>

      <div class="max-w-lg mx-auto px-6 py-10">
        {/* ── Step 1: Plan ── */}
        <Show when={step() === 1}>
          <h2 class="text-2xl font-extrabold text-center tracking-tight">
            {t('billing_checkout_ready_title')}
          </h2>
          <p class="text-sm text-base-content/50 text-center mt-1 mb-8">
            {t('billing_checkout_ready_subtitle')}
          </p>

          {/* Plan card */}
          <div class="border-2 border-primary rounded-2xl p-7">
            <div class="text-center mb-6">
              <p class="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">
                Pro
              </p>
              <span class="text-3xl font-extrabold tracking-tight">
                €{seatPrice().toFixed(2)}
              </span>
              <span class="text-sm text-base-content/50 ml-1">
                {t('billing_per_user_month')}
              </span>
            </div>

            <div class="border-t border-base-300 -mx-7 mb-6" />

            <div class="space-y-3">
              <div class="flex items-center gap-2 text-sm">
                <i class="fa-solid fa-check text-primary" />
                <span>{t('billing_feature_unlimited_members')}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <i class="fa-solid fa-check text-primary" />
                <span>{t('billing_feature_invoices')}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div class="border border-base-300 rounded-2xl p-5 mt-6">
            <div class="flex justify-between text-sm py-1.5">
              <span class="text-base-content/60">Pro</span>
              <span class="font-semibold">
                €{seatPrice().toFixed(2)} / user
              </span>
            </div>
            <div class="flex justify-between text-sm py-1.5">
              <span class="text-base-content/60">{t('members')}</span>
              <span class="font-semibold">
                {memberCount()} × €{seatPrice().toFixed(2)}
              </span>
            </div>
            <div class="flex justify-between text-base font-bold pt-3.5 mt-2 border-t border-base-200">
              <span>Total per month</span>
              <span>€{total()}</span>
            </div>
          </div>

          <button
            class="w-full mt-6 py-4 bg-primary hover:bg-primary-focus text-primary-content font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            onClick={() => setStep(2)}
          >
            {t('billing_subscribe')}
            <i class="fa-solid fa-arrow-right text-sm" />
          </button>
        </Show>

        {/* ── Step 2: Payment ── */}
        <Show when={step() === 2}>
          <h2 class="text-2xl font-extrabold text-center tracking-tight">
            {t('billing_checkout_payment_title')}
          </h2>
          <p class="text-sm text-base-content/50 text-center mt-1 mb-8">
            {t('billing_checkout_payment_subtitle')}
          </p>

          {/* Order summary mini */}
          <div class="bg-base-200/50 border border-base-300 rounded-xl p-4 mb-6">
            <p class="text-sm font-bold mb-2">{t('billing_order_summary')}</p>
            <div class="flex justify-between text-sm text-base-content/60 py-0.5">
              <span>Pro</span>
              <span>€{seatPrice().toFixed(2)} / user</span>
            </div>
            <div class="flex justify-between text-sm text-base-content/60 py-0.5">
              <span>{t('members')}</span>
              <span>{memberCount()}</span>
            </div>
            <div class="flex justify-between text-sm font-bold pt-2 mt-2 border-t border-base-300">
              <span>Total</span>
              <span>€{total()}/mo</span>
            </div>
          </div>

          {/* Payment method selection */}
          <div class="grid grid-cols-3 gap-2.5 mb-6">
            <PaymentMethodButton
              method="creditcard"
              label={t('billing_payment_creditcard')}
              icon="fa-solid fa-credit-card"
              selected={selectedMethod() === 'creditcard'}
              onClick={() => setSelectedMethod('creditcard')}
            />
            <PaymentMethodButton
              method="ideal"
              label={t('billing_payment_ideal')}
              icon="fa-solid fa-building-columns"
              selected={selectedMethod() === 'ideal'}
              onClick={() => setSelectedMethod('ideal')}
            />
            <PaymentMethodButton
              method="sepa"
              label={t('billing_payment_sepa')}
              icon="fa-solid fa-building-columns"
              selected={selectedMethod() === 'sepa'}
              onClick={() => setSelectedMethod('sepa')}
            />
          </div>

          <p class="text-xs text-base-content/40 text-center mb-4">
            {t('billing_checkout_redirect_notice')}
          </p>

          <Show when={checkoutError()}>
            <div class="flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium bg-error/10 border-error/20 text-error mb-4">
              <i class="fa-solid fa-circle-xmark text-xs" />
              <span>{checkoutError()}</span>
            </div>
          </Show>

          <button
            class="w-full py-4 bg-primary hover:bg-primary-focus text-primary-content font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            onClick={handleCheckout}
            disabled={checkingOut()}
          >
            <Show
              when={checkingOut()}
              fallback={
                <>
                  <i class="fa-solid fa-lock text-sm" />
                  Pay €{total()}/mo
                </>
              }
            >
              <span class="loading loading-spinner loading-sm" />
            </Show>
          </button>

          <button
            class="w-full mt-3 py-3 border border-base-300 rounded-xl text-sm font-semibold text-base-content/60 hover:border-base-content/30 hover:text-base-content flex items-center justify-center gap-2 transition-colors"
            onClick={() => setStep(1)}
          >
            <i class="fa-solid fa-arrow-left text-xs" />
            {t('back')}
          </button>

          <p class="text-xs text-base-content/40 text-center mt-5 leading-relaxed">
            {t('billing_checkout_terms_notice')}
          </p>
        </Show>

        {/* ── Step 3: Confirmation ── */}
        <Show when={step() === 3}>
          <div class="text-center pt-5">
            <div class="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <i class="fa-solid fa-check text-3xl text-success" />
            </div>
            <h2 class="text-2xl font-extrabold tracking-tight">
              {t('billing_checkout_success_title')}
            </h2>
            <p class="text-sm text-base-content/50 mt-1 mb-8">
              {t('billing_checkout_success_subtitle')}
            </p>

            <div class="border border-base-300 rounded-2xl p-5 text-left mb-6">
              <div class="flex justify-between text-sm py-1.5">
                <span class="text-base-content/60">Plan</span>
                <span class="font-semibold">Pro</span>
              </div>
              <div class="flex justify-between text-sm py-1.5">
                <span class="text-base-content/60">{t('members')}</span>
                <span class="font-semibold">{memberCount()}</span>
              </div>
              <div class="flex justify-between text-sm py-1.5">
                <span class="text-base-content/60">{t('billing')}</span>
                <span class="font-semibold">Monthly</span>
              </div>
              <div class="flex justify-between text-base font-bold pt-3.5 mt-2 border-t border-base-200">
                <span>Amount</span>
                <span>€{total()}/mo</span>
              </div>
            </div>

            <button
              class="w-full py-4 bg-primary hover:bg-primary-focus text-primary-content font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              onClick={() => navigate('/home')}
            >
              {t('billing_go_to_home')}
              <i class="fa-solid fa-arrow-right text-sm" />
            </button>
          </div>
        </Show>
      </div>
    </div>
  )
}

function StepIndicator(props: {
  num: number
  label: string
  active: boolean
  done: boolean
}): JSXElement {
  return (
    <div
      class={`flex items-center gap-2 text-sm font-semibold whitespace-nowrap ${
        props.active || props.done ? 'text-primary' : 'text-base-content/40'
      }`}
    >
      <div
        class={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          props.active || props.done
            ? 'bg-primary text-primary-content'
            : 'bg-base-100 border-2 border-base-300 text-base-content/40'
        }`}
      >
        <Show when={props.done} fallback={props.num}>
          <i class="fa-solid fa-check text-[10px]" />
        </Show>
      </div>
      <span class="hidden sm:inline">{props.label}</span>
    </div>
  )
}

function PaymentMethodButton(props: {
  method: string
  label: string
  icon: string
  selected: boolean
  onClick: () => void
}): JSXElement {
  return (
    <button
      class={`flex flex-col items-center gap-1.5 py-3 px-3 border rounded-xl text-xs font-semibold transition-all ${
        props.selected
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-base-300 bg-base-100 text-base-content/60 hover:border-primary/30'
      }`}
      onClick={() => props.onClick()}
    >
      <i class={`${props.icon} text-lg`} />
      {props.label}
    </button>
  )
}
