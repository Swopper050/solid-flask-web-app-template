import { createSignal, JSXElement, Show } from 'solid-js'
import { useUser } from '../../context/UserProvider'
import { useLocale } from '../../context/LocaleProvider'
import { clsx } from 'clsx'

import { resendVerificationMail } from '../../api'

import { ChangePasswordModal } from './modals/ChangePassword'
import { Enable2FAModal } from './modals/Enable2FA'
import { Disable2FAModal } from './modals/Disable2FA'
import { DeleteAccountModal } from './modals/DeleteAccount'
import { createModalState } from '../../components/Modal'
import { Table, TableRow } from '../../components/Table'
import { Button } from '../../components/Button'

export function UserAccountPage(): JSXElement {
  const { t } = useLocale()
  const { user } = useUser()

  const [modalState, openModal, closeModal] = createModalState(
    'password',
    'enable2FA',
    'disable2FA',
    'deleteAcount'
  )

  return (
    <>
      <div class="mx-auto">
        <Show when={user()?.isAdmin}>
          <p class="text-lg text-success mr-4 mb-6 col-span-4">
            <i class="fa-solid fa-screwdriver-wrench mr-2" />
            {t('this_user_is_an_admin')}
          </p>
        </Show>

        <Table>
          <TableRow
            cells={[t('email'), user()?.email, <VerifyEmailButton />]}
          />
          <TableRow
            cells={[
              t('password'),
              '*******',
              <p class="tooltip tooltip-left" data-tip={t('change_password')}>
                <button
                  class={clsx('btn btn-ghost btn-sm')}
                  onClick={() => openModal('password')}
                >
                  <i class="fa-solid fa-edit text-primary" />
                </button>
              </p>,
            ]}
          />

          <TableRow
            cells={[
              t('enabled_2fa'),
              <p class="col-span-2">
                {user()?.twoFactorEnabled ? t('yes') : t('no')}
              </p>,
              <Toggle2FAButton
                enable2FA={() => openModal('enable2FA')}
                disable2FA={() => openModal('disable2FA')}
              />,
            ]}
          />
        </Table>

        <div class="mt-4">
          <Button onClick={() => openModal('deleteAcount')} variant="error">
            <i class="fa-solid fa-trash" />
            {t('delete_account')}
          </Button>
        </div>

        <ChangePasswordModal
          isOpen={modalState().password}
          onClose={() => closeModal('password')}
        />

        <DeleteAccountModal
          isOpen={modalState().deleteAcount}
          onClose={() => closeModal('deleteAcount')}
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
      when={user()?.isVerified}
      fallback={
        <div class="flex items-center">
          <p class="grow" />
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
      <Show when={user()?.twoFactorEnabled}>
        <p class="tooltip tooltip-left" data-tip={t('disable_2fa')}>
          <button
            class="btn btn-ghost btn-sm"
            onClick={() => props.disable2FA()}
          >
            <i class="fa-solid fa-toggle-on text-success" />
          </button>
        </p>
      </Show>

      <Show when={!user()?.twoFactorEnabled}>
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
