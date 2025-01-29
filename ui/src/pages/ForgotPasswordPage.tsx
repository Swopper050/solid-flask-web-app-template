import { JSXElement, Show } from 'solid-js'
import { A } from '@solidjs/router'
import { clsx } from 'clsx'

import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { TextInput } from '../components/TextInput'

import {
  createForm,
  email,
  required,
  setResponse,
  SubmitHandler,
} from '@modular-forms/solid'

import { forgotPassword } from '../api'

type ForgotPasswordFormData = {
  email: string
}

export function ForgotPasswordPage(): JSXElement {
  const [forgotPasswordForm, ForgotPassword] =
    createForm<ForgotPasswordFormData>()

  const onPasswordReset: SubmitHandler<ForgotPasswordFormData> = async (
    values
  ) => {
    const response = await forgotPassword(values.email)

    if (response.status != 200) {
      setResponse(forgotPasswordForm, {
        status: 'error',
        message: (await response.json()).error_message,
      })
      return
    }

    setResponse(forgotPasswordForm, { status: 'success' })
  }

  return (
    <>
      <div class="navbar fixed bg-base-100 top-0 left-0">
        <div class="flex-1" />
        <ThemeSwitcher />
      </div>

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">
          {'Woops, I forgot my password'}
        </h1>
      </div>

      <div class="flex justify-center mt-20">
        <ForgotPassword.Form onSubmit={onPasswordReset}>
          <ForgotPassword.Field
            name="email"
            validate={[
              required('Please enter your email'),
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
          </ForgotPassword.Field>

          <Show when={forgotPasswordForm.response.status === 'success'}>
            <div class="flex justify-center mt-4">
              <div role="alert" class="alert alert-success w-80">
                <span>
                  If a user with this email exists, a reset password mail has
                  been sent
                </span>
              </div>
            </div>
          </Show>

          <Show when={forgotPasswordForm.response.status === 'error'}>
            <div class="flex justify-center mt-4">
              <div role="alert" class="alert alert-error w-80">
                <i class="fa-solid fa-circle-exclamation" />{' '}
                <span>{forgotPasswordForm.response.message}</span>
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
                (forgotPasswordForm.response.status === 'success' ||
                  forgotPasswordForm.submitting) &&
                  'btn-disabled'
              )}
              type="submit"
            >
              <Show
                when={forgotPasswordForm.submitting}
                fallback="Reset password"
              >
                <span class="loading loading-spinner" />
                Resetting
              </Show>
            </button>
          </div>
        </ForgotPassword.Form>
      </div>
    </>
  )
}
