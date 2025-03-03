import { JSXElement, Switch, Match, createSignal } from 'solid-js'
import { clsx } from 'clsx'
import { UsersAdmin } from './UsersAdmin'

import { useLocale } from '../../context/LocaleProvider'

type AdminTab = 'organisations' | 'users'

export function AdminPage(): JSXElement {
  const { t } = useLocale()

  const [tab, setTab] = createSignal<AdminTab>('users')

  return (
    <>
      <div class="navbar bg-base-100 border-b border-primary">
        <a
          class={clsx(
            'btn font-bold text-lg mx-2',
            tab() === 'users' ? 'btn-outline' : 'btn-ghost'
          )}
          onClick={() => setTab('users')}
        >
          {t('users')}
        </a>
      </div>

      <div class="flex-grow overflow-hidden">
        <Switch>
          <Match when={tab() === 'users'}>
            <UsersAdmin />
          </Match>
        </Switch>
      </div>
    </>
  )
}
