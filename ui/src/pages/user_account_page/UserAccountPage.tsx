import { createSignal, JSXElement, Show } from 'solid-js'
import { useUser } from '../../context/UserProvider'
import { useLocale } from '../../context/LocaleProvider'
import { clsx } from 'clsx'

import { resendVerificationMail } from '../../api'

import { ChangePasswordModal } from './ChangePasswordModal'
import { Enable2FAModal } from './Enable2FAModal'
import { Disable2FAModal } from './Disable2FAModal'
import { DeleteAccountModal } from './DeleteAccountModal'

export function UserAccountPage(): JSXElement {
  const { t } = useLocale()
  const { user } = useUser()

  const [openPasswordModal, setOpenPasswordModal] = createSignal(false)
  const [openDeleteAccountModal, setOpenDeleteAccountModal] =
    createSignal(false)
  const [openEnable2FAModal, setOpenEnable2FAModal] = createSignal(false)
  const [openDisable2FAModal, setOpenDisable2FAModal] = createSignal(false)

  return (
    <>
      <div class="mt-4 ml-10">
        <Show when={user().isAdmin}>
          <p class="text-lg text-success mr-4 mb-6 col-span-4">
            <i class="fa-solid fa-screwdriver-wrench mr-2" />
            {t('this_user_is_an_admin')}
          </p>
        </Show>

        <div>
          <table class="table table-fixed">
            <tbody>
              <tr>
                <td>{t('email')}</td>
                <td>{user().email}</td>
                <td class="text-end">
                  <VerifyEmailButton />
                </td>
              </tr>
              <tr>
                <td>{t('password')}</td>
                <td>*********</td>
                <td class="text-end">
                  <p
                    class="tooltip tooltip-left"
                    data-tip={t('change_password')}
                  >
                    <button
                      class={clsx('btn btn-ghost btn-sm')}
                      onClick={() => setOpenPasswordModal(true)}
                    >
                      <i class="fa-solid fa-edit text-primary" />
                    </button>
                  </p>
                </td>
              </tr>
              <tr>
                <td>{t('enabled_2fa')}</td>
                <td>
                  <p class="text-lg col-span-2">
                    {user().twoFactorEnabled ? t('yes') : t('no')}
                  </p>
                </td>
                <td class="text-end">
                  <Toggle2FAButton
                    enable2FA={() => setOpenEnable2FAModal(true)}
                    disable2FA={() => setOpenDisable2FAModal(true)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4">
          <button
            class="btn btn-error"
            onClick={() => setOpenDeleteAccountModal(true)}
          >
            <i class="fa-solid fa-trash" />
            {t('delete_account')}
          </button>
        </div>

        <ChangePasswordModal
          isOpen={openPasswordModal()}
          onClose={() => setOpenPasswordModal(false)}
        />

        <DeleteAccountModal
          isOpen={openDeleteAccountModal()}
          onClose={() => setOpenDeleteAccountModal(false)}
        />

        <Enable2FAModal
          isOpen={openEnable2FAModal()}
          onClose={() => setOpenEnable2FAModal(false)}
        />

        <Disable2FAModal
          isOpen={openDisable2FAModal()}
          onClose={() => setOpenDisable2FAModal(false)}
        />
      </div>
    </>
  )
}

function VerifyEmailButton(): JSXElement {
  const { t } = useLocale()
  const { user } = useUser()

  const [sending, setSending] = createSignal(false)

  const onResendVerificationMail = async () => {
    setSending(true)
    await resendVerificationMail()
    setSending(false)
  }

  return (
    <Show
      when={user().isVerified}
      fallback={
        <div class="flex items-center">
          <p class="flex-grow" />
          <p
            class="tooltip tooltip-left"
            data-tip={t('your_email_is_not_verified_yet')}
          >
            <i class="fa-solid fa-triangle-exclamation text-warning" />
          </p>

          <span
            class="tooltip tooltip-left ml-2"
            data-tip={t('resend_verification_email')}
          >
            <button
              class={clsx('btn btn-ghost btn-sm', sending() && 'btn-disabled')}
              onClick={onResendVerificationMail}
            >
              <Show
                when={!sending()}
                fallback={<span class="loading loading-ball loading-sm" />}
              >
                <i class="fa-solid fa-arrow-rotate-left" />
              </Show>
            </button>
          </span>
        </div>
      }
    >
      <p
        class="tooltip tooltip-left mr-3"
        data-tip={t('your_email_has_been_verified')}
      >
        <i class="fa-solid fa-check text-success" />
      </p>
    </Show>
  )
}

function Toggle2FAButton(props: {
  enable2FA: () => void
  disable2FA: () => void
}): JSXElement {
  const { t } = useLocale()
  const { user } = useUser()

  return (
    <>
      <Show when={user().twoFactorEnabled}>
        <p class="tooltip tooltip-left" data-tip={t('disable_2fa')}>
          <button
            class="btn btn-ghost btn-sm"
            onClick={() => props.disable2FA()}
          >
            <i class="fa-solid fa-toggle-on text-success" />
          </button>
        </p>
      </Show>

      <Show when={!user().twoFactorEnabled}>
        <p class="tooltip tooltip-left" data-tip={t('enable_2fa')}>
          <button
            class="btn btn-ghost btn-sm"
            onClick={() => props.enable2FA()}
          >
            <i class="fa-solid fa-toggle-off text-error" />
          </button>
        </p>
      </Show>
    </>
  )
}
