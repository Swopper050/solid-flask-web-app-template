import { createSignal, JSXElement, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { useUser } from '../../context'
import { clsx } from 'clsx'

import api from '../../api'
import { ChangePasswordForm } from './ChangePasswordForm'
import { Modal, ModalBaseProps } from '../../components/Modal'
import { Enable2FAModal } from '../../components/Enable2FAModal'
import { Disable2FAModal } from '../../components/Disable2FAModal'

export function UserProfilePage(): JSXElement {
  const { user } = useUser()
  const [openPasswordModal, setOpenPasswordModal] = createSignal(false)
  const [openDeleteAccountModal, setOpenDeleteAccountModal] = createSignal(false)

  return (
    <>
      <div class="mt-4 ml-10">
        <Show when={user().isAdmin}>
          <p class="text-lg text-success mr-4 mb-6 col-span-4">
            <i class="fa-solid fa-screwdriver-wrench mr-2" />
            This user is an admin
          </p>
        </Show>

        <div>
          <table class="table table-fixed">
            <tbody>
              <tr>
                <td>Email</td>
                <td>{user().email}</td>
                <td class="text-end">
                  <VerifyEmailButton />
                </td>
              </tr>
              <tr>
                <td>Password</td>
                <td>*********</td>
                <td class="text-end">
                  <p class="tooltip tooltip-left" data-tip="Change password">
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
                <td>2FA enabled</td>
                <td>
                  <p class="text-lg col-span-2">
                    {user().twoFactorEnabled ? 'Yes' : 'No'}
                  </p>
                </td>
                <td class="text-end">
                  <Toggle2FAButton />
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
            Delete account
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

      </div>
    </>
  )
}

function VerifyEmailButton(): JSXElement {
  const { user } = useUser()
  const [sending, setSending] = createSignal(false)

  const resendVerificationMail = () => {
    setSending(true)
    api.post('/resend_email_verification').finally(() => setSending(false))
  }

  return (
    <Show
      when={user().isVerified}
      fallback={
        <div class="flex items-center">
          <p class="flex-grow" />
          <p class="tooltip" data-tip="Your email is not verified yet">
            <i class="fa-solid fa-triangle-exclamation text-warning" />
          </p>

          <span class="ml-2 tooltip" data-tip="Resend verification mail">
            <button
              class={clsx('btn btn-ghost btn-sm', sending() && 'btn-disabled')}
              onClick={resendVerificationMail}
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
        data-tip="Your email has been verified"
      >
        <i class="fa-solid fa-check text-success" />
      </p>
    </Show>
  )
}

function Toggle2FAButton(): JSXElement {
  const { user } = useUser()

  const [openEnable2FAModal, setOpenEnable2FAModal] = createSignal(false)
  const [openDisable2FAModal, setOpenDisable2FAModal] = createSignal(false)

  return (
    <>
      <Show when={user().twoFactorEnabled}>
        <p class="tooltip tooltip-left" data-tip="Disable 2FA">
          <button
            class="btn btn-ghost btn-sm"
            onClick={() => setOpenDisable2FAModal(true)}
          >
            <i class="fa-solid fa-toggle-on text-success" />
          </button>

          <Disable2FAModal 
            isOpen={openDisable2FAModal()}
            onClose={() => setOpenDisable2FAModal(false)}
          />
        </p>
      </Show>

      <Show when={!user().twoFactorEnabled}>
        <p class="tooltip tooltip-left" data-tip="Enable 2FA">
          <button
            class="btn btn-ghost btn-sm"
            onClick={() => setOpenEnable2FAModal(true)}
          >
            <i class="fa-solid fa-toggle-off text-error" />
          </button>

          <Enable2FAModal 
            isOpen={openEnable2FAModal()}
            onClose={() => setOpenEnable2FAModal(false)}
          />
        </p>
      </Show>
    </>
  )
}

function ChangePasswordModal(props: ModalBaseProps): JSXElement {
  return (
    <Modal
      title="Change password"
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <ChangePasswordForm onSubmitted={props.onClose} />
    </Modal>
  )
}

function DeleteAccountModal(props: ModalBaseProps): JSXElement {
  const { setUser } = useUser()

  const [deleting, setDeleting] = createSignal(false)
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)

  const navigate = useNavigate()

  const deleteAccount = async () => {
    setDeleting(true)
    setErrorMsg(null)

    api
      .delete('/delete_account')
      .then(() => {
        setUser(null)
        navigate('/home')
      })
      .catch((error) => {
        setErrorMsg(
          error.response.data.error_message ?? 'Could not delete account'
        )
      })
      .finally(() => {
        setDeleting(false)
      })
  }

  return (
    <Modal
      title="Deleting account"
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
        <p class="py-4">Are you sure you want to delete your account?</p>
        <p>This action cannot be undone.</p>

        <Show when={errorMsg() !== null}>
          <div role="alert" class="alert alert-error my-6">
            <span>{errorMsg()}</span>
          </div>
        </Show>

        <div class="modal-action">
          <form method="dialog">
            <button class={clsx('btn mr-2', deleting() && 'btn-disabled')} onClick={props.onClose}>
              Cancel
            </button>
          </form>

          <button
            class={clsx('btn btn-error', deleting() && 'btn-disabled')}
            onClick={deleteAccount}
          >
            <Show when={deleting()}>
              <span class="loading loading-ball" />
            </Show>
            Delete
          </button>
        </div>
    </Modal>
  )
}
