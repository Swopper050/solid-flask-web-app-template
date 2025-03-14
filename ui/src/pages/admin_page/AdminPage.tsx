import { JSXElement } from 'solid-js'
import { UsersAdmin } from './UsersAdmin'

import { useLocale } from '../../context/LocaleProvider'

export function AdminPage(): JSXElement {
  const { t } = useLocale()

  return (
    <>
      <div class="tabs tabs-lift m-2">
        <input
          type="radio"
          name="admin-tabs"
          class="tab text-lg"
          aria-label={t('users')}
        />
        <div class="tab-content bg-base-100 border-base-300 p-6">
          <UsersAdmin />
        </div>

        <input
          type="radio"
          name="admin-tabs"
          class="tab text-lg"
          aria-label="Another tab"
          checked
        />
        <div class="tab-content bg-base-100 border-base-300 p-6">
          Another tab
        </div>
      </div>
    </>
  )
}
