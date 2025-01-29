import { createSignal, JSXElement, Show } from 'solid-js'
import { A, useNavigate } from '@solidjs/router'
import { clsx } from 'clsx'

import { useUser } from '../context'

import { logout } from '../api'

function ProfileMenu(): JSXElement {
  const navigate = useNavigate()

  const { user, setUser } = useUser()
  const [loggingOut, setLoggingOut] = createSignal(false)
  const [showLogoutFailedToast, setShowLogoutFailedToast] = createSignal(false)

  const timeLogoutFailedToast = () => {
    setShowLogoutFailedToast(true)
    setTimeout(() => setShowLogoutFailedToast(false), 5000)
  }

  const onLogout = async () => {
    setLoggingOut(true)

    const response = await logout()

    if (response.status === 200) {
      setUser(null)
      setLoggingOut(false)
      navigate('/')
    }

    timeLogoutFailedToast()
    setLoggingOut(false)
  }

  return (
    <details class="dropdown dropdown-end">
      <summary class="btn btn-ghost">
        <span class="text">{user().email}</span>
        <i class="fa-solid fa-ellipsis" />
      </summary>

      <ul class="menu dropdown-content bg-base-200 rounded-box z-[100]">
        <li class="text-left">
          <A class="btn btn-ghost text-left" href="/profile">
            <i class="fa-regular fa-address-card" />
            Profile
          </A>
        </li>
        <li class="text-left">
          <button
            class={clsx(
              'btn',
              'btn-ghost',
              'text-left',
              loggingOut() && 'btn-disabled'
            )}
            onClick={onLogout}
          >
            <Show
              when={loggingOut()}
              fallback={<i class="fa-solid fa-arrow-right-from-bracket" />}
            >
              <span class="loading loading-ball text-neutral loading-sm" />
            </Show>
            Logout
          </button>
        </li>
      </ul>

      <Show when={showLogoutFailedToast()}>
        <div class="toast toast-end">
          <div class="alert alert-error">
            <span>Could not logout. Please try again later</span>
          </div>
        </div>
      </Show>
    </details>
  )
}

export default ProfileMenu
