import { createSignal, JSXElement, Show } from 'solid-js'
import { A, useNavigate } from '@solidjs/router'
import { clsx } from 'clsx'

import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { Alert } from './Alert'

import { logout } from '../api'

export function ProfileMenu(): JSXElement {
  const navigate = useNavigate()

  const { t } = useLocale()
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

      <ul class="menu dropdown-content bg-base-200 w-40 rounded-box z-[100]">
        <li>
          <A class="btn btn-ghost justify-start" href="/account">
            <i class="fa-regular fa-address-card" />
            {t('account')}
          </A>
        </li>

        <Show when={user().isAdmin}>
          <li>
            <A class="btn btn-ghost justify-start" href="/admin-panel">
              <i class="fa-solid fa-screwdriver-wrench text-success" />
              <p class="text-success">{t('admin_panel')}</p>
            </A>
          </li>
        </Show>

        <li>
          <button
            class={clsx(
              'btn',
              'btn-ghost',
              'justify-start',
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
            {t('logout')}
          </button>
        </li>
      </ul>

      <Show when={showLogoutFailedToast()}>
        <div class="toast toast-end">
          <Alert
            type="error"
            message={t('could_not_log_out_please_try_again_later')}
          />
        </div>
      </Show>
    </details>
  )
}
