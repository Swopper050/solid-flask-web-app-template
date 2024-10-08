import { JSXElement, Show } from 'solid-js'
import { useUser } from '../context'
import { ChangePassword } from '../components/ChangePassword'

export function UserProfilePage(): JSXElement {
  const { user } = useUser()

  return (
    <div class="mt-4 ml-10">
      <div class="grid grid-cols-12 gap-4">
        <p class="text-lg font-bold mr-4 col-span-1">Email:</p>
        <p class="text-lg col-span-2">{user().email}</p>
      </div>

      <ChangePassword />

      <Show when={user().isAdmin}>
        <p class="text-lg text-success font-bold mr-4 mt-6 col-span-4">
          <i class="fa-solid fa-screwdriver-wrench mr-2" />
          This user is an admin
        </p>
      </Show>
    </div>
  )
}
