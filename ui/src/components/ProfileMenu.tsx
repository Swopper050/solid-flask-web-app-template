import { createSignal, JSXElement, Show } from 'solid-js'
import { A, useNavigate } from '@solidjs/router'
import { clsx } from 'clsx'

import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { Toast } from './Toast'

import { logout } from '../api'

function ProfileMenu(): JSXElement {
  const navigate = useNavigate()

  const { t } = useLocale()
  const { user, setUser } = useUser()

  const [loggingOut, setLoggingOut] = createSignal(false)
  const [showLogoutFailed, setShowLogoutFailed] = createSignal(false)

  const onLogout = async () => {
    setLoggingOut(true)

    const response = await logout()

    if (response.status === 200) {
      setUser(null)
      setLoggingOut(false)
      navigate('/')
    }

    setShowLogoutFailed(true)
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
          <A class="btn btn-ghost text-left" href="/account">
            <i class="fa-regular fa-address-card" />
            {t('account')}
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
            {t('logout')}
          </button>
        </li>
      </ul>

      <Show when={showLogoutFailed()}>
        <Toast
          message={t('could_not_log_out_please_try_again_later')}
          type="error"
          duration={5000}
          onClear={() => setShowLogoutFailed(false)}
        />
      </Show>
    </details>
  )
}

export default ProfileMenu
