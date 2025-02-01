import { JSXElement, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { clsx } from 'clsx'

import {
  clearResponse,
  createForm,
  reset,
  minLength,
  getValue,
  pattern,
  email,
  required,
  setResponse,
  SubmitHandler,
} from '@modular-forms/solid'

import { register } from '../api'

import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { User } from '../models/User'

import { TextInput } from './TextInput'
import { Modal, ModalBaseProps } from './Modal'
import { Alert } from './Alert'

type RegisterFormData = {
  email: string
  password: string
  checkPassword: string
}

export function RegisterModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()
  const { setUser } = useUser()

  const [registerForm, Register] = createForm<RegisterFormData>()

  const navigate = useNavigate()

  const newPassword = () => {
    return getValue(registerForm, 'password', {
      shouldActive: false,
      shouldTouched: true,
      shouldDirty: true,
      shouldValid: true,
    })
  }

  const mustMatch = (
    error: string
  ): ((value: string | undefined) => string) => {
    return (value: string | undefined) => {
      return value !== newPassword() ? error : ''
    }
  }

  const onSubmit: SubmitHandler<RegisterFormData> = async (values) => {
    const response = await register(values.email, values.password)

    if (response.status !== 200) {
      setResponse(registerForm, {
        status: 'error',
        message: (await response.json()).error_message,
      })
      return
    }

    const data = await response.json()
    setUser(new User(data))
    setResponse(registerForm, { status: 'success', data: data })

    onClose()
    navigate('/home')
  }

  const onClose = () => {
    clearResponse(registerForm)
    reset(registerForm)
  }

  return (
    <Modal
      title={t('register')}
      isOpen={props.isOpen}
      onClose={() => {
        onClose()
        props.onClose()
      }}
    >
      <Register.Form onSubmit={onSubmit}>
        <Register.Field
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
        </Register.Field>

        <Register.Field
          name="password"
          validate={[
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
        </Register.Field>

        <Register.Field
          name="checkPassword"
          validate={[mustMatch(t('passwords_do_not_match'))]}
        >
          {(field, props) => (
            <TextInput
              {...props}
              type="password"
              value={field.value}
              error={field.error}
              placeholder={t('confirm_password')}
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Register.Field>

        <Show when={registerForm.response.status === 'error'}>
          <Alert type="error" message={registerForm.response.message} />
        </Show>

        <div class="modal-action">
          <button
            class={clsx(
              'mt-4 btn btn-primary',
              registerForm.submitting && 'btn-disabled'
            )}
            type="submit"
          >
            {t('register')}
            <Show when={registerForm.submitting}>
              <span class="loading loading-ball" />
            </Show>
          </button>
        </div>
      </Register.Form>
    </Modal>
  )
}
