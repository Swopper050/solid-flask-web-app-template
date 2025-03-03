import { createSignal, createResource, JSXElement, Show, For } from 'solid-js'
import { clsx } from 'clsx'

import { Alert } from '../../components/Alert'
import { Pagination } from '../../components/Pagination'
import { getUsers } from '../../api'

import { useLocale } from '../../context/LocaleProvider'

export function UsersAdmin(): JSXElement {
  const { t } = useLocale()

  const [page, setPage] = createSignal(1)
  const [perPage] = createSignal(25)

  const [users, { refetch }] = createResource(() => getUsers(page(), perPage()))

  const onPageChange = (newPage: number) => {
    setPage(newPage)
    refetch()
  }

  return (
    <>
      <div class="flex justify-between m-4">
        <Pagination
          page={page()}
          totalPages={(users.loading || users.error) ? undefined : users()?.meta.total_pages}
          refetch={onPageChange}
        />
      </div>

      <div class="overflow-x-auto m-4">
        <table class="table w-full">
          <thead>
            <tr>
              <th class="w-1/12">{t('id')}</th>
              <th class="w-2/12">{t('email')}</th>
              <th class="w-5/12">{t('verified')}</th>
              <th class="text-right w-3/12">
                <button
                  class="btn btn-primary btn-sm"
                  onClick={() =>
                    document.getElementById('create_new_user').showModal()
                  }
                >
                  <i class="fa-solid fa-plus" />
                  {t('create_new_user')}
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            <Show
              when={!users.loading && !users.error}
            >
              <For each={users().items}>
                {(user) => {
                  return (
                    <tr>
                      <td>{user.id}</td>
                      <td>
                        {user.email}
                        <Show when={user.is_admin}>
                          <span class="tooltip tooltip-right" data-tip={t('this_user_is_an_admin')}>
                            <i class="fa-solid fa-screwdriver-wrench text-success ml-2" />
                          </span>
                        </Show>
                      </td>
                      <td>
                        <Show 
                          when={user.is_verified}
                          fallback={
                            <span class="tooltip tooltip-right" data-tip={t('this_user_has_not_been_verified_yet')}>
                              <i class="fa-solid fa-triangle-exclamation text-warning" />
                            </span>
                          }
                        >
                          <span class="tooltip tooltip-right" data-tip={t('this_user_has_been_verified')}>
                            <i class="fa-solid fa-check text-success" />
                          </span>
                        </Show>
                      </td>
                      <td class="text-right">
                        <button
                          class={clsx(
                            'btn btn-ghost btn-sm mx-1',
                            user.is_admin && 'btn-disabled'
                          )}
                          onClick={() =>
                            document
                              .getElementById(`confirm_delete_user_${props.user.id}`)
                              .showModal()
                          }
                        >
                          <i
                            class={clsx(
                              'fa-solid fa-trash',
                              !props.user.isAdmin && 'text-error'
                            )}
                          />
                        </button>
                        TODO delete
                      </td>
                    </tr>
                  )
                }}
              </For>
            </Show>
          </tbody>
        </table>

        <Show when={users.loading}>
          <div class="flex justify-center mt-8 w-full">
            <span class="loading loading-ball loading-sm" />
          </div>
        </Show>

        <Show when={users.error} >
          <div class="flex justify-center items-center mt-8 w-full">
            <Alert type="error" message={t('error_loading_users')} extraClasses="w-80" />
          </div>
        </Show>
      </div>
    </>
  )
}
