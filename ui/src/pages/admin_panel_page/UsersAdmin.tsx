import { createSignal, createResource, JSXElement, Show, For } from 'solid-js'

import { Pagination } from '../../components/Pagination'
import { getUsers } from '../../api'

export function UsersAdmin(): JSXElement {
  const [page, setPage] = createSignal(1)
  const [perPage] = createSignal(10)

  const [users] = createResource(() => getUsers(page(), perPage()))

  const onPageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <>
      <div class="flex justify-between mt-4">
        <Pagination
          page={page()}
          totalPages={users()?.meta.total_pages}
          refetch={onPageChange}
        />
      </div>

      <div class="overflow-x-auto mx-4">
        <Show
          when={!users.loading}
          fallback={
            <div class="flex jusitfy-center items-center h-20">
              <div class="loading loading-ball loading-lg text-primary" />
            </div>
          }
        >
          <Show when={!users.error} fallback={
            TODO
          }>
            <table class="table w-full">
              <thead>
                <tr>
                  <th class="w-1/12">ID</th>
                  <th class="w-2/12">Email</th>
                  <th class="w-5/12">Organisations</th>
                  <th class="text-right w-3/12">
                    <button
                      class="btn btn-primary btn-sm"
                      onClick={() =>
                        document.getElementById('create_new_user').showModal()
                      }
                    >
                      <i class="fa-solid fa-plus" />
                      Create new user
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <For each={users().items}>
                  {(user) => {
                    return (
                      <tr>
                        <td>{user.id}</td>
                        <td>{user.email}</td>
                        <td><span>Org1</span></td>
                        <td class="text-right">joe</td>
                      </tr>
                    )
                  }}
                </For>
              </tbody>
            </table>
          </Show>
        </Show>
      </div>
    </>
  )
}
