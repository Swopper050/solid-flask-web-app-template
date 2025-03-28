import { JSXElement, createSignal } from 'solid-js'
import { A } from '@solidjs/router'

import { ProfileMenu } from '../components/ProfileMenu'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { LanguageSelector } from '../components/LanguageSelector'

import { useLocale } from '../context/LocaleProvider'

interface BasePageProps {
  mainComponent: () => JSXElement
}

export function BasePage(props: BasePageProps): JSXElement {
  const { t } = useLocale()
  const [drawerOpen, setDrawerOpen] = createSignal(false)

  return (
    <div class="drawer lg:drawer-open">
      <input
        id="main-sidebar"
        type="checkbox"
        class="drawer-toggle"
        checked={drawerOpen()}
        onChange={(e) => setDrawerOpen(e.currentTarget.checked)}
      />

      <div class="drawer-content flex flex-col m-0 p-0 w-full overflow-x-hidden">
        <div class="navbar bg-base-100">
          <div class="flex-1">
            <label
              for="main-sidebar"
              class="btn btn-square btn-ghost drawer-button lg:hidden"
            >
              <i class="fa-solid fa-bars" />
            </label>
          </div>
          <div class="flex-none gap-2">
            <ThemeSwitcher />
            <LanguageSelector />
            <ProfileMenu />
          </div>
        </div>

        <main class="p-4">{props.mainComponent()}</main>
      </div>

      <div class="drawer-side z-20">
        <label
          for="main-sidebar"
          class="drawer-overlay"
          onClick={() => setDrawerOpen(false)}
        />
        <div class="flex flex-col h-full bg-base-200 min-h-full w-64 sm:w-72">
          <div class="p-4">
            <div class="flex justify-between items-center">
              <A
                class="btn btn-ghost text-xl justify-start"
                href="/"
                onClick={() => setDrawerOpen(false)}
              >
                {t('my_solid_app')}
              </A>
              <button
                class="btn btn-square btn-ghost lg:hidden"
                onClick={() => setDrawerOpen(false)}
              >
                <i class="fa-solid fa-xmark" />
              </button>
            </div>
          </div>
          <ul class="menu text-base-content p-4 w-full flex-1 overflow-y-auto">
            <li class="mb-1 font-bold">
              <A href="/home" onClick={() => setDrawerOpen(false)}>
                <i class="fa-solid fa-home mr-2" />
                {t('home')}
              </A>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
