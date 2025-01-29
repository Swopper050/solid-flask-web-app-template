import { User, UserAttributes } from '../../models/User'
import { createEffect, JSXElement, Show } from 'solid-js'
import { useUser } from '../../context'

import { changePassword } from '../../api'
import {
  clearResponse,
  createForm,
  getValue,
  minLength,
  pattern,
  reset,
  setResponse,
  required,
  SubmitHandler,
} from '@modular-forms/solid'

import { TextInput } from '../../components/TextInput'
import { Modal, ModalBaseProps } from '../../components/Modal'

type ChangePasswordFormData = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export function ChangePasswordModal(props: ModalBaseProps): JSXElement {
  const [changePasswordForm, { Form, Field }] = createForm<
    ChangePasswordFormData,
    UserAttributes
  >()

  const { setUser } = useUser()

  const saved = () => {
    return changePasswordForm.submitted === true
  }

  const newPassword = () => {
    return getValue(changePasswordForm, 'newPassword', {
      shouldActive: false,
      shouldTouched: true,
      shouldDirty: true,
      shouldValid: true,
    })
  }

  /**
   * Custom validator that checks whether the new password matches the new password.
   */
  const mustMatch = (
    error: string
  ): ((value: string | undefined) => string) => {
    return (value: string | undefined) => {
      return value !== newPassword() ? error : ''
    }
  }

  createEffect(() => {
    if (saved()) {
      if (changePasswordForm.response.status === 'success') {
        setUser(new User(changePasswordForm.response.data))
      }
    }
  })

  const onSubmit: SubmitHandler<ChangePasswordFormData> = async (values) => {
    const response = await changePassword(
      values.currentPassword,
      values.newPassword
    )

    if (response.status !== 200) {
      setResponse(changePasswordForm, {
        status: 'error',
        message: (await response.json()).error_message,
      })

      return
    }

    const data = await response.json()

    setResponse(changePasswordForm, {
      status: 'success',
      data: data,
    })

    props.onClose()

    clearResponse(changePasswordForm)
    reset(changePasswordForm)
  }

  return (
    <Modal
      title="Change password"
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <Form onSubmit={onSubmit}>
        <Field name="currentPassword">
          {(field, props) => (
            <TextInput
              {...props}
              type="password"
              value={field.value}
              error={field.error}
              placeholder="Current password"
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Field>
        <Field
          name="newPassword"
          validate={[
            required('Please enter a new password.'),
            minLength(8, 'Your password must have 8 characters or more.'),
            pattern(/[A-Z]/, 'Must contain 1 uppercase letter.'),
            pattern(/[a-z]/, 'Must contain 1 lower case letter.'),
            pattern(/[0-9]/, 'Must contain 1 digit.'),
          ]}
        >
          {(field, props) => (
            <TextInput
              {...props}
              type="password"
              value={field.value}
              error={field.error}
              placeholder="New password"
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Field>
        <Field
          name="confirmNewPassword"
          validate={[mustMatch("Passwords don't match")]}
        >
          {(field, props) => (
            <TextInput
              {...props}
              type="password"
              value={field.value}
              error={field.error}
              placeholder="Confirm new password"
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Field>

        <Show when={changePasswordForm.response.status === 'error'}>
          <div role="alert" class="alert alert-error my-4">
            <i class="fa-solid fa-circle-exclamation" />{' '}
            <span>{changePasswordForm.response.message}</span>
          </div>
        </Show>

        <div class="modal-action">
          <button class="btn btn-primary" type="submit">
            <Show
              when={changePasswordForm.submitting}
              fallback="Change password"
            >
              <span class="loading loading-spinner" />
              Saving
            </Show>
          </button>
        </div>
      </Form>
    </Modal>
  )
}
