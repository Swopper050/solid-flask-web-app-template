import { createSignal, JSXElement, Show } from 'solid-js'
import { useUser } from '../context'
import { ChangePassword } from '../components/ChangePassword'
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
        <p class="text-lg font-bold mr-4 col-span-1">Email:</p>
        <p class="text-lg col-span-2">
          {user().email}
          <Show
            when={user().isVerified}
            fallback={
              <>
                <span
                  class="ml-4 tooltip"
                  data-tip="Your email is not verified yet"
                >
                  <i class="fa-solid fa-triangle-exclamation text-warning" />
                </span>
                <span class="ml-4 tooltip" data-tip="Resend verification mail">
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
            <p class="ml-4 tooltip" data-tip="Your email has been verified">
              <i class="fa-solid fa-check text-success" />
            </p>
          </Show>
        </p>
      </div>

      <ChangePassword />
    </div>
  )
}
