import { JSXElement } from 'solid-js'
import { UsersAdmin } from './UsersAdmin'

import { useLocale } from '../../context/LocaleProvider'

export function AdminPage(): JSXElement {
  const { t } = useLocale()

  return (
    <>
      <div class="tabs tabs-lift">
        <input
          type="radio"
          name="admin-tabs"
          class="tab text-lg"
          aria-label={t('users')}
          checked
        />
        <div class="tab-content bg-base-100 border-base-300 p-6">
          <UsersAdmin />
        </div>

        <input
          type="radio"
          name="admin-tabs"
          class="tab text-lg"
          aria-label="Another tab"
        />
        <div class="tab-content bg-base-100 border-base-300 p-6">
          Another tab
        </div>
      </div>
    </>
  )
}
