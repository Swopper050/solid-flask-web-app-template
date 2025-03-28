import { createSignal, createResource, JSXElement, Show, For } from 'solid-js'

import { UserAttributes } from '../../models/User'
import { Alert } from '../../components/Alert'
import { Pagination } from '../../components/Pagination'
import {
  createUser,
  getUsers,
  deleteUser,
  CreateUserData,
  DeleteUserData,
} from '../../api'

import { BooleanInput } from '../../components/BooleanInput'
import { TextInput } from '../../components/TextInput'
import { createModalState, Modal, ModalBaseProps } from '../../components/Modal'

import { useLocale } from '../../context/LocaleProvider'

import { pattern, email, minLength, required } from '@modular-forms/solid'
import { Table, TableRow } from '../../components/Table'
import { Tooltip } from '../../components/Tooltip'
import { Button } from '../../components/Button'
import { createFormState } from '../../form_helpers'

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

  const UserEmail = (props: { user: UserAttributes }): JSXElement => {
    return (
      <>
        {props.user.email}
        <Show when={props.user.is_admin}>
          <Tooltip text={t('this_user_is_an_admin')}>
            <i class="fa-solid fa-screwdriver-wrench text-success ml-2" />
          </Tooltip>
        </Show>
      </>
    )
  }

  const IsVerified = (props: { user: UserAttributes }): JSXElement => {
    return (
      <Show
        when={props.user.is_verified}
        fallback={
          <Tooltip text={t('this_user_has_not_been_verified_yet')}>
            <i class="fa-solid fa-triangle-exclamation text-warning" />
          </Tooltip>
        }
      >
        <Tooltip text={t('this_user_has_been_verified')}>
          <i class="fa-solid fa-check text-success" />
        </Tooltip>
      </Show>
    )
  }

  const DeleteUserButton = (props: { user: UserAttributes }): JSXElement => {
    return (
      <button
        class="btn btn-ghost btn-sm mx-1"
        onClick={() => handleDelete(props.user)}
      >
        <i class="fa-solid fa-trash text-error" />
      </button>
    )
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
      <Table
        headers={[
          t('id'),
          t('email'),
          t('verified'),
          <button
            class="btn btn-primary btn-sm"
            onClick={() => openModal('createUser')}
          >
            <i class="fa-solid fa-plus" />
            <p class="hidden md:block">{t('create_new_user')}</p>
          </button>,
        ]}
      >
        <Show when={!users.loading && !users.error}>
          <For each={users()?.items}>
            {(user) => {
              return (
                <>
                  <TableRow
                    cells={[
                      user.id,
                      <UserEmail user={user} />,
                      <IsVerified user={user} />,
                      <DeleteUserButton user={user} />,
                    ]}
                  />
                </>
              )
            }}
          </For>
        </Show>
      </Table>

      <Show when={users.loading}>
        <div class="flex justify-center mt-8 w-full">
          <span class="loading loading-ball loading-xl" />
        </div>
      </Show>

      <Show when={users.error}>
        <div class="flex justify-center items-center mt-8 w-full">
          <Alert type="error" message={t('error_loading_users')} class="w-80" />
        </div>
      </Show>

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

function DeleteUserModal(
  props: {
    user: UserAttributes | null
    onDelete: () => void
  } & ModalBaseProps
): JSXElement {
  const { t } = useLocale()
  const user = () => props.user

  const {
    state,
    onSubmit,
    components: { Form },
  } = createFormState<DeleteUserData>({
    action: () => deleteUser({ userID: user()?.id ?? 0 }),
    onFinish: () => {
      props.onDelete()
      props.onClose()
    },
  })

  return (
    <Modal
      title={t('delete_user')}
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <p class="mt-4">{t('delete_user_confirmation')}</p>
      <p class="mt-2 font-bold">{props.user?.email}</p>

      <Show when={state.response.status === 'error'}>
        <Alert type="error" message={state.response.message} />
      </Show>

      <Form onSubmit={onSubmit}>
        <div class="modal-action">
          <Button
            label={t('cancel')}
            class="btn-outline"
            isLoading={state.submitting}
            onClick={(e) => {
              e?.preventDefault()
              props.onClose()
            }}
          />

          <Button
            label={t('delete')}
            type="submit"
            color="error"
            isLoading={state.submitting}
          />
        </div>
      </Form>
    </Modal>
  )
}

interface CreateUserModalProps extends ModalBaseProps {
  onCreate: () => void
}

function CreateUserModal(props: CreateUserModalProps): JSXElement {
  const { t } = useLocale()

  const {
    state,
    onSubmit,
    components: { Form, Field },
  } = createFormState<CreateUserData>({
    action: createUser,
    onFinish: () => {
      props.onClose()
    },
  })

  return (
    <Modal
      title={t('create_new_user')}
      isOpen={props.isOpen}
      onClose={() => props.onClose()}
    >
      <div class="space-y-4">
        <Show when={state.response.status === 'error'}>
          <Alert type="error" message={state.response.message} />
        </Show>

        <Form onSubmit={onSubmit} class="w-full">
          <Field
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
          </Field>

          <Field
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
          </Field>

          <Field name="isAdmin" type="boolean">
            {(field, props) => (
              <BooleanInput
                {...props}
                type="checkbox"
                value={field.value ?? false}
                error={field.error}
                label={t('make_this_user_an_admin')}
              />
            )}
          </Field>

          <div class="modal-action">
            <Button
              label={t('create_user')}
              type="submit"
              color="primary"
              class="mt-4 w-full"
              isLoading={state.submitting}
            />
          </div>
        </Form>
      </div>
    </Modal>
  )
}
