import { JSXElement, createSignal, onCleanup, onMount } from 'solid-js'
import { A } from '@solidjs/router'

import { FrozenWorkspaceModal } from '../components/FrozenWorkspaceModal'
import { IconButton } from '../components/Button'
import { ProfileMenu } from '../components/ProfileMenu'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { LanguageSelector } from '../components/LanguageSelector'
import { WorkspaceSwitcher } from '../components/WorkspaceSwitcher'

import { useLocale } from '../context/LocaleProvider'
import { useWorkspace } from '../context/WorkspaceProvider'

interface BasePageProps {
  mainComponent: () => JSXElement
}

export function BasePage(props: BasePageProps): JSXElement {
  const { t } = useLocale()
  const { frozenReason, frozenModalOpen, openFrozenModal, closeFrozenModal } =
    useWorkspace()
  const [drawerOpen, setDrawerOpen] = createSignal(false)

  const handleFrozenEvent = () => openFrozenModal()
  onMount(() => window.addEventListener('workspace-frozen', handleFrozenEvent))
  onCleanup(() =>
    window.removeEventListener('workspace-frozen', handleFrozenEvent)
  )

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
        <div class="navbar bg-base-100 border-b border-base-300">
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
        <div class="flex flex-col h-full bg-base-100 border-r border-base-300 min-h-full w-64 sm:w-72">
          <div class="p-4 pb-2">
            <div class="flex justify-between items-center">
              <A
                class="btn btn-ghost text-xl justify-start"
                href="/home"
                onClick={() => setDrawerOpen(false)}
              >
                {t('my_solid_app')}
              </A>
              <IconButton
                icon="fa-solid fa-xmark"
                shape="square"
                size="md"
                class="lg:hidden"
                onClick={() => setDrawerOpen(false)}
              />
            </div>
          </div>

          <WorkspaceSwitcher />

          <ul class="menu text-base-content px-4 w-full flex-1 overflow-y-auto">
            <li class="mb-1 font-bold">
              <A href="/home" onClick={() => setDrawerOpen(false)}>
                <i class="fa-solid fa-home mr-2" />
                {t('home')}
              </A>
            </li>
          </ul>
        </div>
      </div>

      <FrozenWorkspaceModal
        isOpen={frozenModalOpen()}
        onClose={closeFrozenModal}
        frozenReason={frozenReason()}
      />
    </div>
  )
}
