import { JSXElement, Show } from 'solid-js'
import { useUser } from '../context'
import { ChangePassword } from '../components/ChangePassword'

export function UserProfilePage(): JSXElement {
  const { user } = useUser()

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
              <span class="ml-4 tooltip" data-tip="Your email is not verified yet">
                <i class="fa-solid fa-triangle-exclamation text-warning" />
              </span>
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
