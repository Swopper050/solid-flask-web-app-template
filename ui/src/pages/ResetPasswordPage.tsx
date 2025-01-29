import { JSXElement, Show } from 'solid-js'
import { A, useSearchParams } from '@solidjs/router'
import { clsx } from 'clsx'

import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { TextInput } from '../components/TextInput'

import {
  getValue,
  createForm,
  required,
  minLength,
  pattern,
  setResponse,
  SubmitHandler,
} from '@modular-forms/solid'

import { resetPassword } from '../api'

type PasswordResetFormData = {
  password: string
  checkPassword: string
}

export function ResetPasswordPage(): JSXElement {
  const [searchParams] = useSearchParams()
  const [resetPasswordForm, ResetPassword] = createForm<PasswordResetFormData>()

  const onResetPassword: SubmitHandler<PasswordResetFormData> = async (
    values
  ) => {
    const response = await resetPassword(
      searchParams.email,
      searchParams.reset_token,
      values.password
    )

    if (response.status != 200) {
      setResponse(resetPasswordForm, {
        status: 'error',
        message: (await response.json()).error_message,
      })
      return
    }

    setResponse(resetPasswordForm, { status: 'success' })
  }

  const newPassword = () => {
    return getValue(resetPasswordForm, 'password', {
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

  return (
    <>
      <div class="navbar fixed bg-base-100 top-0 left-0">
        <div class="flex-1" />
        <ThemeSwitcher />
      </div>

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">{'Reset password'}</h1>
      </div>

      <div class="flex justify-center mt-20">
        <div class="flex flex-col w-80">
          <ResetPassword.Form onSubmit={onResetPassword}>
            <ResetPassword.Field
              name="password"
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
            </ResetPassword.Field>

            <ResetPassword.Field
              name="checkPassword"
              validate={[
                required('Please confirm your new password.'),
                mustMatch('Passwords do not match'),
              ]}
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
            </ResetPassword.Field>

            <Show when={resetPasswordForm.response.status === 'success'}>
              <div class="flex justify-center my-4">
                <div role="alert" class="alert alert-success w-80">
                  <span>Successfully reset password</span>
                </div>
              </div>
            </Show>

            <Show when={resetPasswordForm.response.status === 'error'}>
              <div class="flex justify-center my-4">
                <div role="alert" class="alert alert-error w-80">
                  <i class="fa-solid fa-circle-exclamation" />{' '}
                  <span>{resetPasswordForm.response.message}</span>
                </div>
              </div>
            </Show>

            <div class="flex justify-center mt-10">
              <A class="btn btn-primary btn-outline" href="/home">
                Back to home
              </A>

              <button
                class={clsx(
                  'btn btn-primary ml-4',
                  (resetPasswordForm.response.status === 'success' ||
                    resetPasswordForm.submitting) &&
                    'btn-disabled'
                )}
                type="submit"
              >
                <Show
                  when={resetPasswordForm.submitting}
                  fallback="Reset password"
                >
                  <span class="loading loading-spinner" />
                  Resetting
                </Show>
              </button>
            </div>
          </ResetPassword.Form>
        </div>
      </div>
    </>
  )
}
