import { createSignal, createResource, JSXElement, Show, For } from 'solid-js'
import { clsx } from 'clsx'

import { UserAttributes } from '../../models/User'
import { Alert } from '../../components/Alert'
import { Pagination } from '../../components/Pagination'
import { createUser, getUsers, deleteUser } from '../../api'

import { BooleanInput } from '../../components/BooleanInput'
import { TextInput } from '../../components/TextInput'
import { createModalState, Modal, ModalBaseProps } from '../../components/Modal'

import { useLocale } from '../../context/LocaleProvider'

import {
  clearResponse,
  createForm,
  reset,
  pattern,
  email,
  minLength,
  required,
  setResponse,
  SubmitHandler,
} from '@modular-forms/solid'


export function UsersAdmin(): JSXElement {
  const { t } = useLocale()

  const [page, setPage] = createSignal(1)
  const [perPage] = createSignal(10)

  const [users, { refetch }] = createResource(() => getUsers(page(), perPage()))

  const [selectedUser, setSelectedUser] = createSignal<UserAttributes | null>(
    null
  )

  const [modalState, openModal, closeModal] = createModalState(
    'deleteUser',
    'createUser'
  )

  const onPageChange = (newPage: number) => {
    setPage(newPage)
    refetch()
  }

  const handleDelete = (user: UserAttributes | null) => {
    setSelectedUser(user)
    openModal('deleteUser')
  }

  return (
    <>
      <div class="flex justify-between m-4">
        <Pagination
          page={page()}
          totalPages={
            users.loading || users.error ? undefined : users()?.meta.total_pages
          }
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
                  onClick={() => openModal('createUser')}
                >
                  <i class="fa-solid fa-plus" />
                  {t('create_new_user')}
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            <Show when={!users.loading && !users.error}>
              <For each={users().items}>
                {(user) => {
                  return (
                    <tr>
                      <td>{user.id}</td>
                      <td>
                        {user.email}
                        <Show when={user.is_admin}>
                          <span
                            class="tooltip tooltip-right"
                            data-tip={t('this_user_is_an_admin')}
                          >
                            <i class="fa-solid fa-screwdriver-wrench text-success ml-2" />
                          </span>
                        </Show>
                      </td>
                      <td>
                        <Show
                          when={user.is_verified}
                          fallback={
                            <span
                              class="tooltip tooltip-right"
                              data-tip={t(
                                'this_user_has_not_been_verified_yet'
                              )}
                            >
                              <i class="fa-solid fa-triangle-exclamation text-warning" />
                            </span>
                          }
                        >
                          <span
                            class="tooltip tooltip-right"
                            data-tip={t('this_user_has_been_verified')}
                          >
                            <i class="fa-solid fa-check text-success" />
                          </span>
                        </Show>
                      </td>
                      <td class="text-right">
                        <button
                          class="btn btn-ghost btn-sm mx-1"
                          onClick={() => handleDelete(user)}
                        >
                          <i class="fa-solid fa-trash text-error" />
                        </button>
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
            <span class="loading loading-ball loading-xl" />
          </div>
        </Show>

        <Show when={users.error}>
          <div class="flex justify-center items-center mt-8 w-full">
            <Alert
              type="error"
              message={t('error_loading_users')}
              extraClasses="w-80"
            />
          </div>
        </Show>
      </div>

      <CreateUserModal
        isOpen={modalState().createUser}
        onClose={() => closeModal('createUser')}
        onCreate={refetch}
      />

      {selectedUser() !== null && (
        <DeleteUserModal
          isOpen={modalState().deleteUser}
          onClose={() => closeModal('deleteUser')}
          user={selectedUser()}
          onDelete={() => {
            refetch()
          }}
        />
      )}
    </>
  )
}

interface DeleteUserModalProps extends ModalBaseProps {
  user: UserAttributes
  onDelete: () => void
}

function DeleteUserModal(props: DeleteUserModalProps): JSXElement {
  const { t } = useLocale()

  const [deleteForm, Delete] = createForm()

  const handleDelete = async () => {
    const response = await deleteUser(props.user.id)

    if (response.status !== 200) {
      setResponse(deleteForm, {
        status: 'error',
        message: (await response.json()).error_message,
      })
      return
    }

    setResponse(deleteForm, { status: 'success' })
    props.onClose()
    props.onDelete()
  }

  return (
    <Modal
      title={t('delete_user')}
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <p class="mt-4">{t('delete_user_confirmation')}</p>
      <p class="mt-2 font-bold">{props.user.email}</p>

      <Delete.Form onSubmit={handleDelete}>
        <Show when={deleteForm.response.status === 'error'}>
          <Alert type="error" message={deleteForm.response.message} />
        </Show>

        <div class="modal-action">
          <button
            class={clsx(
              'btn btn-outline',
              deleteForm.submitting && 'btn-disabled'
            )}
            onClick={() => props.onClose()}
          >
            {t('cancel')}
          </button>
          <button
            class={clsx(
              'btn btn-error',
              deleteForm.submitting && 'btn_disabled'
            )}
            type="submit"
          >
            {t('delete')}
            <Show when={deleteForm.submitting}>
              <span class="loading loading-ball" />
            </Show>
          </button>
        </div>
      </Delete.Form>
    </Modal>
  )
}

interface CreateUserModalProps extends ModalBaseProps {
  onCreate: () => void
}

type CreateUserFormData = {
  email: string
  password: string
  isAdmin: boolean
}

function CreateUserModal(props: CreateUserModalProps): JSXElement {
  const { t } = useLocale()

  const [createUserForm, Create] = createForm<CreateUserFormData>()

  const handleCreate: SubmitHandler<CreateUserFormData> = async (values) => {
    const response = await createUser(
      values.email,
      values.password,
      values.isAdmin
    )

    if (response.status !== 200) {
      setResponse(createUserForm, {
        status: 'error',
        message: (await response.json()).error_message,
      })
      return
    }

    setResponse(createUserForm, { status: 'success' })
    onClose()
    props.onCreate()
  }

  const onClose = () => {
    reset(createUserForm)
    clearResponse(createUserForm)
    props.onClose()
  }

  return (
    <Modal title={t('create_new_user')} isOpen={props.isOpen} onClose={onClose}>
      <Create.Form onSubmit={handleCreate}>
        <Create.Field
          name="email"
          validate={[
            required(t('please_enter_your_email')),
            email(t('please_enter_a_valid_email')),
          ]}
        >
          {(field, props) => (
            <TextInput
              {...props}
              type="email"
              value={field.value}
              error={field.error}
              placeholder={t('email_placeholder')}
              icon={<i class="fa-solid fa-envelope" />}
            />
          )}
        </Create.Field>

        <Create.Field
          name="password"
          validate={[
            required(t('please_enter_a_password')),
            minLength(8, t('your_password_must_have_8_characters_or_more')),
            pattern(/[A-Z]/, t('your_password_must_have_1_uppercase_letter')),
            pattern(/[a-z]/, t('your_password_must_have_1_lowercase_letter')),
            pattern(/[0-9]/, t('your_password_must_have_1_digit')),
          ]}
        >
          {(field, props) => (
            <TextInput
              {...props}
              type="password"
              value={field.value}
              error={field.error}
              placeholder={t('password')}
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Create.Field>

        <Create.Field name="isAdmin" type="boolean">
          {(field, props) => (
            <BooleanInput
              {...props}
              type="checkbox"
              value={field.value}
              error={field.error}
              label={t('make_this_user_an_admin')}
            />
          )}
        </Create.Field>

        <Show when={createUserForm.response.status === 'error'}>
          <Alert type="error" message={createUserForm.response.message} />
        </Show>

        <div class="modal-action">
          <button
            class={clsx(
              'mt-4 btn btn-primary',
              createUserForm.submitting && 'btn-disabled'
            )}
            type="submit"
          >
            {t('create_user')}
            <Show when={createUserForm.submitting}>
              <span class="loading loading-ball" />
            </Show>
          </button>
        </div>
      </Create.Form>
    </Modal>
  )
}
