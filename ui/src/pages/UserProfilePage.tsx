import {
  createEffect,
  createSignal,
  JSX,
  JSXElement,
  Show,
  splitProps,
} from 'solid-js'
import { useUser } from '../context'
import { clsx } from 'clsx'

import api, { changePassword } from '../api'
import { PasswordIcon } from '../components/icons/Password'
import {
  clearResponse,
  createForm,
  getValue,
  MaybeValue,
  minLength,
  pattern,
  reset,
  setResponse,
  SubmitHandler,
} from '@modular-forms/solid'

import { User, UserAttributes } from '../models/User'

export function UserProfilePage(): JSXElement {
  const { user } = useUser()

  const [openPasswordModal, setOpenPasswordModal] = createSignal(false)

  return (
    <>
      <div class="mt-4 ml-10">
        <Show when={user().isAdmin}>
          <p class="text-lg text-success mr-4 mb-6 col-span-4">
            <i class="fa-solid fa-screwdriver-wrench mr-2" />
            This user is an admin
          </p>
        </Show>

        <div>
          <table class="table">
            <tbody>
              <tr>
                <td>Email:</td>
                <td>{user().email}</td>
                <td>
                  <VerifyEmailButton />
                </td>
              </tr>
              <tr>
                <td>Password:</td>
                <td>*********</td>
                <td>
                  <p class="tooltip" data-tip="Change password">
                    <button
                      class={clsx('btn btn-ghost btn-sm')}
                      onClick={() => setOpenPasswordModal(true)}
                    >
                      <i class="fa-solid fa-edit" />
                    </button>
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ChangePasswordModal
          isOpen={openPasswordModal()}
          onClose={() => setOpenPasswordModal(false)}
        />
      </div>
    </>
  )
}

function VerifyEmailButton(): JSXElement {
  const { user } = useUser()
  const [sending, setSending] = createSignal(false)

  const resendVerificationMail = () => {
    setSending(true)
    api.post('/resend_email_verification').finally(() => setSending(false))
  }

  return (
    <p
      class="tooltip"
      data-tip={user().isVerified ? 'Resend verification' : 'Verify email'}
    >
      <button
        class={clsx('btn btn-ghost btn-sm', sending() && 'btn-disabled')}
        onClick={resendVerificationMail}
      >
        <Show
          when={sending()}
          fallback={
            <i
              class={clsx(
                user().isVerified ? 'fa-solid fa-warning' : 'fa-solid fa-check'
              )}
            />
          }
        >
          <button class="loading loading-ball loading-sm" />
        </Show>
      </button>
    </p>
  )
}

type ChangePasswordFormData = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

type Value = MaybeValue<string | number>

function ChangePasswordForm(props: { onSubmitted: () => void }): JSXElement {
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

    if (response.status != 200) {
      setResponse(changePasswordForm, {
        status: 'error',
        message: 'Failed to update password.',
      })

      return
    }

    const data = await response.json()

    setResponse(changePasswordForm, {
      status: 'success',
      data: data,
    })

    props.onSubmitted()

    clearResponse(changePasswordForm)
    reset(changePasswordForm)
  }

  /**
   * Custom validator that checks whether the new password matches the new password.
   */
  const mustMatch = (error: string): ((value: Value) => string) => {
    return (value: Value) => {
      return value !== newPassword() ? error : ''
    }
  }

  return (
    <Form onSubmit={onSubmit}>
      <Show when={changePasswordForm.response.status === 'error'}>
        <div role="alert" class="mt-2 mb-2 alert alert-error">
          <i class="fa-solid fa-circle-exclamation" />{' '}
          <span>{changePasswordForm.response.message}</span>
        </div>
      </Show>

      <Field name="currentPassword">
        {(field, props) => (
          <TextInput
            {...props}
            type="password"
            value={field.value}
            error={field.error}
            placeholder="Current password"
          />
        )}
      </Field>
      <Field
        name="newPassword"
        validate={[
          minLength(8, 'You password must have 8 characters or more.'),
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
          />
        )}
      </Field>
      <button class="mt-4 btn btn-primary " type="submit">
        <Show when={changePasswordForm.submitting} fallback="Change">
          <span class="loading loading-spinner" />
          Saving
        </Show>
      </button>
    </Form>
  )
}

function ChangePasswordModal(props: {
  isOpen: boolean
  onClose: () => void
}): JSXElement {
  return (
    <Modal
      title="Change password"
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <ChangePasswordForm onSubmitted={props.onClose} />
    </Modal>
  )
}

type TextInputProps = {
  name: string
  type: 'text' | 'email' | 'tel' | 'password' | 'url' | 'date'
  label?: string
  placeholder?: string
  value: string | undefined
  error: string
  required?: boolean
  ref: (element: HTMLInputElement) => void
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>
  onChange: JSX.EventHandler<HTMLInputElement, Event>
  onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>
}

export function TextInput(props: TextInputProps) {
  const [, inputProps] = splitProps(props, ['value', 'label', 'error'])
  return (
    <div>
      <label
        for={props.name}
        class={clsx(
          'input input-bordered flex items-center mt-4',
          props.error !== '' && 'input-error'
        )}
      >
        {props.label} {props.required && <span>*</span>}
        <PasswordIcon />
        <input
          class="grow ml-2"
          {...inputProps}
          id={props.name}
          value={props.value || ''}
          aria-invalid={!!props.error}
          aria-errormessage={`${props.name}-error`}
        />
      </label>
      {props.error && <div id={`${props.name}-error`}>{props.error}</div>}
    </div>
  )
}

function Modal(props: {
  title: string
  isOpen: boolean
  children: JSXElement | JSXElement[]
  onClose: () => void
}): JSXElement {
  const isOpen = () => props.isOpen

  return (
    <>
      <dialog class={clsx('modal', isOpen() ? 'modal-open' : 'modal-close')}>
        <div class="modal-box">
          <button
            class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            onClick={() => props.onClose()}
          >
            ✕
          </button>
          <h3 class="font-bold text-lg">{props.title}</h3>
          {props.children}
        </div>
      </dialog>
    </>
  )
}
