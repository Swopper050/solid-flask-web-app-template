import { createSignal, JSXElement, Show } from 'solid-js'
import { A } from '@solidjs/router'
import { clsx } from 'clsx'

import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { EmailIcon } from '../components/icons/Email'

import api from '../api'

export function ForgotPasswordPage(): JSXElement {
  const [email, setEmail] = createSignal<string | null>(null)
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)
  const [submitting, setSubmitting] = createSignal(false)
  const [success, setSuccess] = createSignal(false)

  const requestPasswordReset = async () => {
    setSubmitting(true)
    setSuccess(false)
    setErrorMsg(null)

    api
      .post('/forgot_password', JSON.stringify({ email: email() }))
      .then(() => {
        setSuccess(true)
      })
      .catch((error) => {
        setErrorMsg(
          error.response.data.error_message ?? 'Could not reset password'
        )
      })
      .finally(() => {
        setSubmitting(false)
      })
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
        <label class="input input-bordered flex items-center gap-2 mb-3 w-80">
          <EmailIcon />
          <input
            type="text"
            class="grow"
            placeholder="your@email.com"
            value={email()}
            disabled={success()}
            onInput={(e) =>
              setEmail(e.target.value === '' ? null : e.target.value)
            }
          />
        </label>
      </div>

      <Show when={success()}>
        <div class="flex justify-center mt-4">
          <div role="alert" class="alert alert-success w-80">
            <span>
              If a user with this email exists, a reset password mail has been
              sent
            </span>
          </div>
        </div>
      </Show>

      <Show when={errorMsg() !== null}>
        <div class="flex justify-center mt-4">
          <div role="alert" class="alert alert-error w-80">
            <span>{errorMsg()}</span>
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
            (email() === null || success() || submitting()) && 'btn-disabled'
          )}
          onClick={requestPasswordReset}
        >
          <Show when={submitting()}>
            <span class="loading loading-spinner" />
          </Show>
          Reset password
        </button>
      </div>
    </>
  )
}
