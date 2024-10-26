import { createSignal, JSXElement, Show } from 'solid-js'
import { A, useSearchParams } from '@solidjs/router'
import { clsx } from 'clsx'

import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { PasswordIcon } from '../components/icons/Password'

import { isGoodPassword, passwordConditions } from '../components/utils'

import api from '../api'

export function ResetPasswordPage(): JSXElement {
  const [searchParams] = useSearchParams()

  const [password, setPassword] = createSignal<string | null>(null)
  const [checkPassword, setCheckPassword] = createSignal<string | null>(null)
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)
  const [submitting, setSubmitting] = createSignal(false)
  const [success, setSuccess] = createSignal(false)

  const passwordsMatch = () => {
    return password() === checkPassword()
  }

  const resetPassword = async () => {
    setSubmitting(true)
    setSuccess(false)
    setErrorMsg(null)

    api
      .post(
        '/reset_password',
        JSON.stringify({
          email: searchParams.email,
          reset_token: searchParams.reset_token,
          new_password: password(),
        })
      )
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
        <h1 class="text-4xl text-center font-bold">{'Reset password'}</h1>
      </div>

      <div class="flex justify-center mt-20">
        <div class="flex flex-col w-80">
          <label
            class={clsx(
              'input input-bordered flex items-center gap-2',
              password() !== null &&
                !isGoodPassword(password()) &&
                'input-error'
            )}
          >
            <PasswordIcon />
            <input
              type="password"
              class="grow"
              placeholder="New password"
              value={password()}
              disabled={success()}
              onInput={(e) =>
                setPassword(e.target.value === '' ? null : e.target.value)
              }
            />
          </label>
          <Show when={password() !== null && !isGoodPassword(password())}>
            <div class="label">
              <span class="label-text-alt text-error">
                {passwordConditions()}
              </span>
            </div>
          </Show>
        </div>
      </div>

      <div class="flex justify-center">
        <div class="flex flex-col w-80">
          <label
            class={clsx(
              'input',
              'input-bordered',
              'flex',
              'items-center',
              'gap-2',
              'mt-3',
              !passwordsMatch() && 'input-error'
            )}
          >
            <PasswordIcon />
            <input
              type="password"
              class="grow"
              placeholder="Confirm new password"
              value={checkPassword()}
              disabled={success()}
              onInput={(e) =>
                setCheckPassword(e.target.value === '' ? null : e.target.value)
              }
            />
          </label>
          <Show when={!passwordsMatch()}>
            <div class="label">
              <span class="label-text-alt text-error">
                Passwords do not match
              </span>
            </div>
          </Show>
        </div>
      </div>

      <Show when={success()}>
        <div class="flex justify-center mt-4">
          <div role="alert" class="alert alert-success w-80">
            <span>Successfully reset password</span>
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
            (success() || submitting()) && 'btn-disabled'
          )}
          onClick={resetPassword}
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
