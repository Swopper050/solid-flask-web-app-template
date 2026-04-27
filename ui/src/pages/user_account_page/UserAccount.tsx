import { createSignal, JSXElement, Show } from 'solid-js'
import clsx from 'clsx'

import { resendVerificationMail } from '../../api'
import { useUser } from '../../context/UserProvider'
import { useLocale } from '../../context/LocaleProvider'

import { ThemeSwitcher } from '../../components/ThemeSwitcher'
import { LanguageSelector } from '../../components/LanguageSelector'
import { ChangePasswordModal } from './modals/ChangePassword'
import { Enable2FAModal } from './modals/Enable2FA'
import { Disable2FAModal } from './modals/Disable2FA'
import { DeleteAccountModal } from './modals/DeleteAccount'
import { createModalState } from '../../components/Modal'

export function UserAccountPage(): JSXElement {
  const { t } = useLocale()
  const { user } = useUser()

  const [sending, setSending] = createSignal(false)
  const onResendVerificationMail = async () => {
    setSending(true)
    await resendVerificationMail()
    setSending(false)
  }

  const [modalState, openModal, closeModal] = createModalState(
    'password',
    'enable2FA',
    'disable2FA',
    'deleteAccount'
  )

  const twoFactorEnabled = () => user()?.twoFactorEnabled

  return (
    <div class="flex-1 overflow-y-auto bg-base-200">
      <div class="max-w-[640px] w-full mx-auto px-3 md:px-6 pt-6 md:pt-9 pb-10 md:pb-15 flex flex-col gap-4">
        {/* Page header */}
        <div class="mb-3">
          <h1 class="text-[22px] font-extrabold text-base-content tracking-tight">
            {t('my_account')}
          </h1>
          <p class="text-[13px] text-base-content/40 mt-1">
            {t('manage_personal_data_and_preferences')}
          </p>
        </div>

        {/* ── Profile information ── */}
        <div class="card bg-base-100 border border-base-300 rounded-2xl p-6">
          <div class="font-extrabold text-[15px] text-base-content tracking-tight">
            {t('profile_information')}
          </div>
          <div class="text-xs text-base-content/40 mb-5">
            {t('your_account_details')}
          </div>

          <Show when={user()?.isAdmin}>
            <div class="flex items-center gap-2 px-3.5 py-2.5 bg-primary/5 border border-primary/15 rounded-lg mb-4">
              <i class="fa-solid fa-screwdriver-wrench text-primary shrink-0" />
              <span class="text-xs font-semibold text-primary">
                {t('this_user_is_an_admin')}
              </span>
            </div>
          </Show>

          {/* Email field */}
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <label class="text-xs font-semibold text-base-content">
                {t('email')}
              </label>
              <Show when={user()?.isVerified}>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white">
                  {t('verified')}
                </span>
              </Show>
              <Show when={!user()?.isVerified}>
                <button
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning text-warning-content cursor-pointer"
                  onClick={onResendVerificationMail}
                  disabled={sending()}
                >
                  {sending() ? '...' : t('resend_verification_email')}
                </button>
              </Show>
            </div>
            <input
              type="email"
              class="input w-full border-[1.5px] border-base-300 rounded-lg px-3.5 py-2.5 text-sm bg-base-200/50 text-base-content/40 cursor-not-allowed"
              value={user()?.email ?? ''}
              disabled
            />
          </div>
        </div>

        {/* ── Preferences ── */}
        <div class="card bg-base-100 border border-base-300 rounded-2xl p-6">
          <div class="font-extrabold text-[15px] text-base-content tracking-tight">
            {t('preferences')}
          </div>
          <div class="text-xs text-base-content/40 mb-5">
            {t('theme_and_language')}
          </div>

          <div class="flex items-center justify-between py-3.5 border-b border-base-200">
            <div>
              <div class="text-[13.5px] font-semibold text-base-content">
                {t('theme')}
              </div>
              <div class="text-xs text-base-content/40 mt-0.5">
                {t('switch_between_light_and_dark')}
              </div>
            </div>
            <ThemeSwitcher />
          </div>

          <div class="flex items-center justify-between py-3.5">
            <div>
              <div class="text-[13.5px] font-semibold text-base-content">
                {t('language')}
              </div>
              <div class="text-xs text-base-content/40 mt-0.5">
                {t('select_your_preferred_language')}
              </div>
            </div>
            <LanguageSelector />
          </div>
        </div>

        {/* ── Security ── */}
        <div class="card bg-base-100 border border-base-300 rounded-2xl p-6">
          <div class="font-extrabold text-[15px] text-base-content tracking-tight">
            {t('security')}
          </div>
          <div class="text-xs text-base-content/40 mb-5">
            {t('change_password')} &amp; 2FA
          </div>

          {/* Password row */}
          <div class="flex items-center justify-between py-4 border-b border-base-200">
            <div>
              <div class="text-[13.5px] font-semibold text-base-content">
                {t('password')}
              </div>
              <div class="text-xs text-base-content/40 mt-0.5">••••••••</div>
            </div>
            <button
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-[1.5px] border-base-300 bg-base-100 text-xs font-semibold text-base-content/70 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all whitespace-nowrap"
              onClick={() => openModal('password')}
              data-cy="open-change-password"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {t('change_password')}
            </button>
          </div>

          {/* 2FA row */}
          <div class="flex items-center justify-between py-4">
            <div>
              <div class="text-[13.5px] font-semibold text-base-content">
                {t('enabled_2fa')}
              </div>
              <div class="text-xs text-base-content/40 mt-0.5">
                {twoFactorEnabled() ? t('yes') : t('no')}
              </div>
            </div>
            <button
              class={clsx(
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-[1.5px] text-xs font-semibold transition-all whitespace-nowrap',
                twoFactorEnabled()
                  ? 'border-base-300 bg-base-100 text-base-content/70 hover:border-primary hover:text-primary hover:bg-primary/5'
                  : 'border-primary text-primary bg-primary/5 hover:bg-primary/15'
              )}
              onClick={() =>
                twoFactorEnabled()
                  ? openModal('disable2FA')
                  : openModal('enable2FA')
              }
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {twoFactorEnabled() ? t('disable_2fa') : t('enable_2fa')}
            </button>
          </div>
        </div>

        {/* ── Danger zone ── */}
        <div class="card bg-base-100 border border-error/30 rounded-2xl p-6">
          <div class="font-extrabold text-[15px] text-error tracking-tight">
            {t('delete_account')}
          </div>
          <div class="flex items-center justify-between gap-4 mt-3">
            <div class="text-xs text-base-content/60 leading-relaxed">
              {t('all_data_permanently_deleted')}
            </div>
            <button
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-[1.5px] border-error/30 bg-error/5 text-xs font-semibold text-error hover:bg-error hover:text-white hover:border-error transition-all whitespace-nowrap"
              onClick={() => openModal('deleteAccount')}
              data-cy="delete-account"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
              {t('delete_account')}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={modalState().password}
        onClose={() => closeModal('password')}
      />
      <DeleteAccountModal
        isOpen={modalState().deleteAccount}
        onClose={() => closeModal('deleteAccount')}
      />
      <Enable2FAModal
        isOpen={modalState().enable2FA}
        onClose={() => closeModal('enable2FA')}
      />
      <Disable2FAModal
        isOpen={modalState().disable2FA}
        onClose={() => closeModal('disable2FA')}
      />
    </div>
  )
}
