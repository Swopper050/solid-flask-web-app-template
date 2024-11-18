import { createSignal, JSXElement, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { useUser } from '../context'
import { ChangePassword } from '../components/ChangePassword'
import { Enable2FAModal } from '../components/Enable2FAModal'
import { Disable2FAModal } from '../components/Disable2FAModal'
import { clsx } from 'clsx'

import api from '../api'

export function UserProfilePage(): JSXElement {
  const { user } = useUser()

  const [sending, setSending] = createSignal(false)

  const resendVerificationMail = () => {
    setSending(true)
    api.post('/resend_email_verification').finally(() => setSending(false))
  }

  return (
    <div class="mt-4 ml-10">
      <Show when={user().isAdmin}>
        <p class="text-lg text-success mr-4 mb-6 col-span-4">
          <i class="fa-solid fa-screwdriver-wrench mr-2" />
          This user is an admin
        </p>
      </Show>

      <div class="grid grid-cols-12 gap-4">
        <p class="text-lg font-bold mr-4 col-span-2">Email:</p>
        <p class="text-lg col-span-2">{user().email}</p>
        <p class="text-lg col-span-1">
          <Show
            when={user().isVerified}
            fallback={
              <>
                <span class="tooltip" data-tip="Your email is not verified yet">
                  <i class="fa-solid fa-triangle-exclamation text-warning" />
                </span>
                <span class="ml-2 tooltip" data-tip="Resend verification mail">
                  <button
                    class={clsx(
                      'btn btn-ghost btn-sm',
                      sending() && 'btn-disabled'
                    )}
                    onClick={resendVerificationMail}
                  >
                    <Show when={sending()}>
                      <span class="loading loading-ball loading-sm" />
                    </Show>
                    <i class="fa-solid fa-arrow-rotate-left" />
                  </button>
                </span>
              </>
            }
          >
            <p class="tooltip" data-tip="Your email has been verified">
              <i class="fa-solid fa-check text-success" />
            </p>
          </Show>
        </p>
      </div>

      <div class="grid grid-cols-12 gap-4 mt-2">
        <p class="text-lg font-bold mr-4 col-span-2">2FA enabled:</p>
        <p class="text-lg col-span-2">
          {user().twoFactorEnabled ? 'Yes' : 'No'}
        </p>

        <p>
          <Show when={user().twoFactorEnabled}>
            <button
              onClick={() =>
                document.getElementById('disable_2fa_modal').showModal()
              }
            >
              <i class="fa-solid fa-toggle-on" />
            </button>

            <Disable2FAModal />
          </Show>

          <Show when={!user().twoFactorEnabled}>
            <button
              onClick={() =>
                document.getElementById('enable_2fa_modal').showModal()
              }
            >
              <i class="fa-solid fa-toggle-off" />
            </button>

            <Enable2FAModal />
          </Show>
        </p>
      </div>

      <ChangePassword />

      <div class="mt-4">
        <button
          class="btn btn-error"
          onClick={() =>
            document.getElementById('delete_account_modal').showModal()
          }
        >
          <i class="fa-solid fa-trash" />
          Delete account
        </button>

        <DeleteAccountModal />
      </div>
    </div>
  )
}

function DeleteAccountModal(): JSXElement {
  const { setUser } = useUser()

  const [deleting, setDeleting] = createSignal(false)
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)

  const navigate = useNavigate()

  let modalRef: HTMLDialogElement | undefined

  const deleteAccount = async () => {
    setDeleting(true)
    setErrorMsg(null)

    api
      .delete('/delete_account')
      .then(() => {
        setUser(null)
        modalRef?.close()
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
    <dialog id="delete_account_modal" ref={modalRef} class="modal">
      <div class="modal-box text-center">
        <h3 class="text-lg font-bold">Deleting account</h3>
        <p class="py-4">Are you sure you want to delete your account?</p>
        <p>This action cannot be undone.</p>

        <Show when={errorMsg() !== null}>
          <div role="alert" class="alert alert-error my-6">
            <span>{errorMsg()}</span>
          </div>
        </Show>

        <div class="modal-action justify-center">
          <form method="dialog">
            <button class={clsx('btn mr-2', deleting() && 'btn-disabled')}>
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
      </div>
    </dialog>
  )
}
