import { JSXElement } from 'solid-js'

export function UsersAdmin(): JSXElement {
  return (
    <div class="overflow-x-auto mx-4">
      <table class="table w-full">
        <thead>
          <tr>
            <th class="w-1/12">ID</th>
            <th class="w-1/12">Admin</th>
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
      </table>
    </div>
  )
}
