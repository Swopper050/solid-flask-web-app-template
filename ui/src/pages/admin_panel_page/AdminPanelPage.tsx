import { JSXElement, Switch, Match, createSignal } from 'solid-js'
import { clsx } from 'clsx'
import { UsersAdmin } from './UsersAdmin'

type AdminTab = 'organisations' | 'users'

export function AdminPanelPage(): JSXElement {
  const [tab, setTab] = createSignal<AdminTab>('users')

  return (
    <>
      <div class="navbar bg-base-100">
        <a
          class={clsx(
            'btn font-bold text-lg mx-2',
            tab() === 'users' ? 'btn-outline' : 'btn-ghost'
          )}
          onClick={() => setTab('users')}
        >
          Users
        </a>
      </div>

      <div class="mt-6">
        <Switch>
          <Match when={tab() === 'users'}>
            <UsersAdmin />
          </Match>
        </Switch>
      </div>
    </>
  )
}
