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

import { useUser } from '../context'
import { User } from '../models/User'

import { TextInput } from './TextInput'
import { Modal, ModalBaseProps } from './Modal'

type RegisterFormData = {
  email: string
  password: string
  checkPassword: string
}

export function RegisterModal(props: ModalBaseProps): JSXElement {
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
      title="Register"
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
            required('Please enter an email'),
            email('Please enter a valid email'),
          ]}
        >
          {(field, props) => (
            <TextInput
              {...props}
              type="email"
              value={field.value}
              error={field.error}
              placeholder="your@email.com"
              icon={<i class="fa-solid fa-envelope" />}
            />
          )}
        </Register.Field>

        <Register.Field
          name="password"
          validate={[
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
              placeholder="Password"
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Register.Field>

        <Register.Field
          name="checkPassword"
          validate={[mustMatch("Passwords don't match")]}
        >
          {(field, props) => (
            <TextInput
              {...props}
              type="password"
              value={field.value}
              error={field.error}
              placeholder="Confirm password"
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Register.Field>

        <Show when={registerForm.response.status === 'error'}>
          <div role="alert" class="mt-4 alert alert-error">
            <i class="fa-solid fa-circle-exclamation" />{' '}
            <span>{registerForm.response.message}</span>
          </div>
        </Show>

        <div class="modal-action">
          <button
            class={clsx(
              'mt-4 btn btn-primary',
              registerForm.submitting && 'btn-disabled'
            )}
            type="submit"
          >
            <Show when={registerForm.submitting} fallback="Register">
              <span class="loading loading-spinner" />
              Register
            </Show>
          </button>
        </div>
      </Register.Form>
    </Modal>
  )
}
