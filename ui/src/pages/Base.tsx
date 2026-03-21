import { JSXElement, Show, createSignal, type ParentProps } from 'solid-js'
import { A } from '@solidjs/router'
import clsx from 'clsx'

import { ProfileMenu } from '../components/ProfileMenu'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { LanguageSelector } from '../components/LanguageSelector'
import { useLocale } from '../context/LocaleProvider'

function SidebarContent(props: {
  onNavigate: () => void
  onCollapse: () => void
  collapseIcon: string
  collapseTitle: string
}): JSXElement {
  const { t } = useLocale()

  return (
    <div class="flex flex-col h-full w-64">
      <div class="flex items-center justify-between px-3 py-3 flex-shrink-0">
        <A
          href="/home"
          class="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-base-300 transition-colors min-w-0"
          onClick={() => props.onNavigate()}
        >
          <span class="text-lg font-semibold tracking-tight truncate">
            {t('my_solid_app')}
            <span class="text-primary">.</span>
          </span>
        </A>

        <button
          class="btn btn-xs btn-square btn-ghost opacity-40 hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={() => props.onCollapse()}
          title={props.collapseTitle}
        >
          <i class={clsx('fa-solid text-xs', props.collapseIcon)} />
        </button>
      </div>

      <ul class="menu text-base-content px-2 flex-1 overflow-y-auto pt-1">
        <li>
          <A
            href="/home"
            onClick={() => props.onNavigate()}
            class="flex items-center gap-2 text-sm"
          >
            <i class="fa-solid fa-house w-4 text-center" />
            {t('home')}
          </A>
        </li>
      </ul>
    </div>
  )
}

export function BasePage(props: ParentProps): JSXElement {
  const [collapsed, setCollapsed] = createSignal(
    JSON.parse(localStorage.getItem('sidebarCollapsed') ?? 'false') as boolean
  )
  const [mobileOpen, setMobileOpen] = createSignal(false)

  const toggleCollapsed = () => {
    const next = !collapsed()
    setCollapsed(next)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(next))
  }

  return (
    <div class="flex h-screen overflow-hidden bg-base-100">
      <aside
        class={clsx(
          'hidden lg:flex flex-col flex-shrink-0',
          'bg-base-200 border-r border-base-300',
          'transition-[width] duration-300 ease-in-out overflow-hidden'
        )}
        style={{ width: collapsed() ? '0px' : '256px' }}
      >
        <SidebarContent
          onNavigate={() => {}}
          onCollapse={toggleCollapsed}
          collapseIcon="fa-angles-left"
          collapseTitle="Collapse sidebar"
        />
      </aside>

      <Show when={collapsed()}>
        <button
          class="hidden lg:flex fixed left-0 top-16 z-10 flex-col items-center justify-center w-5 h-10 bg-base-200 border border-base-300 border-l-0 rounded-r-md text-base-content/40 hover:text-base-content hover:bg-base-300 transition-colors"
          onClick={toggleCollapsed}
          title="Expand sidebar"
        >
          <i class="fa-solid fa-chevron-right text-[10px]" />
        </button>
      </Show>

      <Show when={mobileOpen()}>
        <div class="fixed inset-0 z-40 lg:hidden">
          <div
            class="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside class="absolute left-0 inset-y-0 bg-base-200 border-r border-base-300 flex flex-col shadow-xl">
            <SidebarContent
              onNavigate={() => setMobileOpen(false)}
              onCollapse={() => setMobileOpen(false)}
              collapseIcon="fa-xmark"
              collapseTitle="Close sidebar"
            />
          </aside>
        </div>
      </Show>

      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div class="navbar bg-base-100 border-b border-base-300 flex-shrink-0 min-h-12 h-12 px-2">
          <div class="flex-1 flex items-center gap-1">
            <button
              class="btn btn-square btn-ghost btn-sm lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <i class="fa-solid fa-bars" />
            </button>

            <Show when={collapsed()}>
              <button
                class="hidden lg:flex btn btn-square btn-ghost btn-sm"
                onClick={toggleCollapsed}
                title="Expand sidebar"
              >
                <i class="fa-solid fa-table-columns text-sm" />
              </button>
            </Show>
          </div>

          <div class="flex-none flex items-center gap-1">
            <ThemeSwitcher />
            <LanguageSelector />
            <ProfileMenu />
          </div>
        </div>

        <main class="p-4 flex-1 overflow-y-auto">{props.children}</main>
      </div>
    </div>
  )
}
