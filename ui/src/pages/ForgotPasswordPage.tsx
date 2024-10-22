import { createSignal, JSXElement, Show } from 'solid-js'
import { A } from '@solidjs/router'
import { clsx } from 'clsx';

import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { EmailIcon } from '../components/icons/Email';

import api from "../api";

export function ForgotPasswordPage(): JSXElement {
  const [email, setEmail] = createSignal<string | null>(null)
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)
  const [submitting, setSubmitting] = createSignal(false)

  const resetPassword = async () => {
    setSubmitting(true);

    api
      .post('/forgot_password', JSON.stringify({ email: email()}))
      .then((response) => {
        // TODO: show success message
      })
      .catch((error) => {
        setErrorMsg(error.response.data.error_message)
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
            onInput={(e) =>
              setEmail(e.target.value === '' ? null : e.target.value)
            }
          />
        </label>
      </div>

      <div class="flex justify-center mt-4">
        <Show when={errorMsg() !== null}>
          <div role="alert" class="alert alert-error w-80">
            <span>{errorMsg()}</span>
          </div>
        </Show>
      </div>


      <div class="flex justify-center mt-10">
        <A class="btn btn-primary btn-outline" href="/home">
          Back to home
        </A>
        <button class={clsx("btn btn-primary ml-4", email() === null && 'btn-disabled')} onClick={resetPassword}>
          Reset password
        </button>
      </div>
    </>
  )
}
