import { createSignal, JSXElement, Show } from 'solid-js'
import { useUser } from '../../context/UserProvider'
import { useLocale } from '../../context/LocaleProvider'

import { resendVerificationMail } from '../../api'

import { ChangePasswordModal } from './modals/ChangePassword'
import { Enable2FAModal } from './modals/Enable2FA'
import { Disable2FAModal } from './modals/Disable2FA'
import { DeleteAccountModal } from './modals/DeleteAccount'
import { createModalState } from '../../components/Modal'
import { Table, TableRow } from '../../components/Table'
import { Button, IconButton } from '../../components/Button'
import { Tooltip } from '../../components/Tooltip'

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
    'deleteAcount'
  )

  const twoFactorEnabled = () => user()?.twoFactorEnabled

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
            cells={[
              t('email'),
              user()?.email,
              <VerifyEmailButton
                isSending={sending()}
                isVerified={user()?.isVerified ?? false}
                onClick={() => onResendVerificationMail()}
              />,
            ]}
          />
          <TableRow
            cells={[
              t('password'),
              '*******',
              <Tooltip position="left" text={t('change_password')}>
                <IconButton
                  icon="fa-solid fa-edit"
                  onClick={() => openModal('password')}
                  color="primary"
                />
              </Tooltip>,
            ]}
          />

          <TableRow
            cells={[
              t('enabled_2fa'),
              <>{user()?.twoFactorEnabled ? t('yes') : t('no')}</>,
              <Tooltip
                position="left"
                text={twoFactorEnabled() ? t('disable_2fa') : t('enable_2fa')}
              >
                <IconButton
                  onClick={
                    twoFactorEnabled()
                      ? () => openModal('disable2FA')
                      : () => openModal('enable2FA')
                  }
                  color={twoFactorEnabled() ? 'success' : 'error'}
                  icon={
                    twoFactorEnabled()
                      ? 'fa-solid fa-toggle-on'
                      : 'fa-solid fa-toggle-off'
                  }
                />
              </Tooltip>,
            ]}
          />
        </Table>

        <div class="mt-4">
          <Button
            label={t('delete_account')}
            onClick={() => openModal('deleteAcount')}
            color="error"
            icon="fa-solid fa-trash"
          />
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

function VerifyEmailButton(props: {
  isSending: boolean
  isVerified: boolean
  onClick: () => void
}): JSXElement {
  const { t } = useLocale()

  return (
    <Show
      when={props.isVerified}
      fallback={
        <>
          <Tooltip position="left" text={t('your_email_is_not_verified_yet')}>
            <div class="px-3">
              <i class="fa-solid fa-triangle-exclamation text-warning" />
            </div>
          </Tooltip>

          <Tooltip position="left" text={t('resend_verification_email')}>
            <IconButton
              onClick={() => props.onClick()}
              isLoading={props.isSending}
              icon="fa-solid fa-arrow-rotate-left"
              color="primary"
            />
          </Tooltip>
        </>
      }
    >
      <Tooltip position="left" text={t('your_email_has_been_verified')}>
        <div class="mr-3">
          <i class="fa-solid fa-check text-success" />
        </div>
      </Tooltip>
    </Show>
  )
}
