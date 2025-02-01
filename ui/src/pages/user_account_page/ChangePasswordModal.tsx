import { User, UserAttributes } from '../../models/User'
import { createEffect, JSXElement, Show } from 'solid-js'
import { useUser } from '../../context/UserProvider'
import { useLocale } from '../../context/LocaleProvider'
import { clsx } from 'clsx'

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

import { Alert } from '../../components/Alert'
import { TextInput } from '../../components/TextInput'
import { Modal, ModalBaseProps } from '../../components/Modal'

type ChangePasswordFormData = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export function ChangePasswordModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()

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
      title={t('change_password')}
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
              placeholder={t('current_password')}
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Field>
        <Field
          name="newPassword"
          validate={[
            required(t('please_enter_a_new_password')),
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
              placeholder={t('new_password')}
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Field>
        <Field
          name="confirmNewPassword"
          validate={[mustMatch(t('passwords_do_not_match'))]}
        >
          {(field, props) => (
            <TextInput
              {...props}
              type="password"
              value={field.value}
              error={field.error}
              placeholder={t('confirm_new_password')}
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Field>

        <Show when={changePasswordForm.response.status === 'error'}>
          <Alert type="error" message={changePasswordForm.response.message} />
        </Show>

        <div class="modal-action">
          <button
            class={clsx(
              'btn btn-primary',
              changePasswordForm.submitting && 'btn-disabled'
            )}
            type="submit"
          >
            {t('change_password')}
            <Show when={changePasswordForm.submitting}>
              <span class="loading loading-ball" />
            </Show>
          </button>
        </div>
      </Form>
    </Modal>
  )
}
