import { createSignal, JSXElement, Show } from 'solid-js'
import { A, useNavigate } from '@solidjs/router'
import { clsx } from 'clsx'

import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { Toast } from './Toast'
import { DropdownPanel } from './DropdownPanel'
import { Avatar } from './Avatar'

import { logout } from '../api'

export function ProfileMenu(): JSXElement {
  const navigate = useNavigate()

  const { t } = useLocale()
  const { user, setUser } = useUser()

  const [loggingOut, setLoggingOut] = createSignal(false)
  const [showLogoutFailed, setShowLogoutFailed] = createSignal(false)
  const [open, setOpen] = createSignal(false)

  const onLogout = async () => {
    setLoggingOut(true)

    const response = await logout()

    if (response.status === 200) {
      navigate('/')
      setUser(null)
      return
    }

    setShowLogoutFailed(true)
    setLoggingOut(false)
  }

  return (
    <>
      <DropdownPanel
        open={open}
        setOpen={setOpen}
        class="min-w-[220px] py-1.5"
        trigger={
          <button
            class="rounded-full cursor-pointer hover:brightness-90 transition-all"
            data-cy="toggle-profile-menu-dropdown"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(!open())
            }}
          >
            <Avatar
              name={user()?.name}
              email={user()?.email}
              class="w-9 h-9 text-xs"
            />
          </button>
        }
      >
        <div class="px-4 py-2 text-xs text-base-content/50">
          {user()?.email}
        </div>
        <div class="h-px bg-base-300 my-0.5" />
        <A
          class="flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-base-200 cursor-pointer"
          href="/account"
          data-cy="user-account"
          onClick={() => setOpen(false)}
        >
          <i class="fa-solid fa-gear text-base-content/50 text-sm w-4" />
          {t('account')}
        </A>
        <Show when={user()?.isAdmin}>
          <A
            class="flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-base-200 cursor-pointer"
            href="/admin-panel"
            data-cy="admin-panel"
            onClick={() => setOpen(false)}
          >
            <i class="fa-solid fa-screwdriver-wrench text-success text-sm w-4" />
            <span class="text-success">{t('admin_panel')}</span>
          </A>
        </Show>
        <button
          class={clsx(
            'flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-base-200 cursor-pointer w-full text-left',
            loggingOut() && 'opacity-50 pointer-events-none'
          )}
          data-cy="logout"
          onClick={onLogout}
        >
          <Show
            when={loggingOut()}
            fallback={
              <i class="fa-solid fa-arrow-right-from-bracket text-base-content/50 text-sm w-4" />
            }
          >
            <span class="loading loading-ball text-neutral loading-sm" />
          </Show>
          {t('logout')}
        </button>
      </DropdownPanel>

      <Show when={showLogoutFailed()}>
        <Toast
          message={t('could_not_log_out_please_try_again_later')}
          type="error"
          duration={5000}
          onClear={() => setShowLogoutFailed(false)}
        />
      </Show>
    </>
  )
}
