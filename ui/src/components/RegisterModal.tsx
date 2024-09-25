import {JSXElement, createSignal, Show} from "solid-js";
import { clsx } from 'clsx';

import { EmailIcon } from "./icons/Email";
import { PasswordIcon } from "./icons/Password";
import { post } from "../fetch";


export function RegisterModal(): JSXElement {
  const [email, setEmail] = createSignal<string | null>(null);
  const [password, setPassword] = createSignal<string | null>(null);
  const [checkPassword, setCheckPassword] = createSignal<string | null>(null);
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null);

  const [submitting, setSubmitting] = createSignal(false);

  const handleLogin = async () => {
    setSubmitting(true)

    const response = await post(
      '/api/register',
      JSON.stringify({ email: email(), password: password() })
    )

    if (!response.ok) {
      setErrorMsg((await response.json()).error_message)
      setSubmitting(false)
    } else {
      const user = new User(await response.json())
      setUser(user)
      localStorage.setItem('access_token', user.accessToken ?? '')
    }
  }

  return (
    <dialog id="register_modal" class="modal">
      <div class="modal-box">
        <h3 class="flex justify-center text-lg font-bold mb-6">
          Register
        </h3>

        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>

        <label class="input input-bordered flex items-center gap-2 mb-3">
          <EmailIcon />
          <input
            type="text"
            class="grow"
            placeholder="your@email.com"
            value={email()} 
            onInput={(e) => setEmail(e.target.value === "" ? null : e.target.value)}
          />
        </label>

        <label class="input input-bordered flex items-center gap-2 mb-3">
          <PasswordIcon />
          <input
            type="password"
            class="grow"
            placeholder="Your password"
            value={password()}
            onInput={(e) => setPassword(e.target.value === "" ? null : e.target.value)}
          />
        </label>

        <label class={clsx("input", "input-bordered", "flex", "items-center", "gap-2", (password() !== checkPassword()) && "input-error")}>
          <PasswordIcon />
          <input
            type="password"
            class="grow"
            placeholder="Confirm password"
            value={checkPassword()}
            onInput={(e) => setCheckPassword(e.target.value === "" ? null : e.target.value)}
          />
        </label>
        <Show when={password() !== checkPassword()}>
          <div class="label">
            <span class="label-text-alt text-error">Passwords do not match</span>
          </div>
        </Show>

        <Show when={errorMsg() !== null}>
          <div role="alert" class="alert alert-error my-6">
            <span>{errorMsg()}</span>
          </div>
        </Show>

        <div class="modal-action flex justify-center">
          <button
            class={clsx("btn", "btn-primary", submitting() && "btn-disabled")}
            onClick={handleLogin}
          >
            <Show when={submitting()}>
              <span class="loading loading-spinner"></span>
            </Show>
            Register
          </button>
        </div>
      </div>
    </dialog>
  )
}
