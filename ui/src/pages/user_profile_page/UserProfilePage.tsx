import { createSignal, JSXElement, Show } from 'solid-js'
import { useUser } from '../../context'
import { clsx } from 'clsx'

import api from '../../api'
import { ChangePasswordForm } from './ChangePasswordForm'
import { Modal } from '../../components/Modal'

export function UserProfilePage(): JSXElement {
  const { user } = useUser()
  const [openPasswordModal, setOpenPasswordModal] = createSignal(false)

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
          <table class="table">
            <tbody>
              <tr>
                <td>Email:</td>
                <td>{user().email}</td>
                <td>
                  <VerifyEmailButton />
                </td>
              </tr>
              <tr>
                <td>Password:</td>
                <td>*********</td>
                <td>
                  <p class="tooltip" data-tip="Change password">
                    <button
                      class={clsx('btn btn-ghost btn-sm')}
                      onClick={() => setOpenPasswordModal(true)}
                    >
                      <i class="fa-solid fa-edit" />
                    </button>
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ChangePasswordModal
          isOpen={openPasswordModal()}
          onClose={() => setOpenPasswordModal(false)}
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
    <p
      class="tooltip"
      data-tip={user().isVerified ? 'Resend verification' : 'Verify email'}
    >
      <button
        class={clsx('btn btn-ghost btn-sm', sending() && 'btn-disabled')}
        onClick={resendVerificationMail}
      >
        <Show
          when={sending()}
          fallback={
            <i
              class={clsx(
                user().isVerified ? 'fa-solid fa-warning' : 'fa-solid fa-check'
              )}
            />
          }
        >
          <button class="loading loading-ball loading-sm" />
        </Show>
      </button>
    </p>
  )
}

function ChangePasswordModal(props: {
  isOpen: boolean
  onClose: () => void
}): JSXElement {
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
