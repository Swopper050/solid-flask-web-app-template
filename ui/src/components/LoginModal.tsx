import {JSXElement, createSignal, Show} from "solid-js";
import { clsx } from 'clsx';

import { post } from "../fetch";


export function LoginModal(): JSXElement {
  const [email, setEmail] = createSignal<string | null>(null);
  const [password, setPassword] = createSignal<string | null>(null);
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null);

  const [submitting, setSubmitting] = createSignal(false);

  const handleLogin = async () => {
    setSubmitting(true)

    const response = await post(
      '/api/login',
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
    <dialog id="login_modal" class="modal">
      <div class="modal-box">
        <h3 class="flex justify-center text-lg font-bold mb-6">Login</h3>
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <label class="input input-bordered flex items-center gap-2 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            class="h-4 w-4 opacity-70">
            <path
              d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
            <path
              d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
          </svg>
          <input
            type="text"
            class="grow"
            placeholder="your@email.com"
            value={email()} 
            onChange={(e) => setEmail(e.target.value === "" ? null : e.target.value)}
          />
        </label>
        <label class="input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            class="h-4 w-4 opacity-70">
            <path
              fill-rule="evenodd"
              d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
              clip-rule="evenodd" />
          </svg>
          <input
            type="password"
            class="grow"
            placeholder="Your password"
            value={password()}
            onChange={(e) => setPassword(e.target.value === "" ? null : e.target.value)}
          />
        </label>
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
            Login
          </button>
          <button class={clsx("btn", "btn-primary", "btn-outline", submitting() && "btn-disabled")}>Register</button>
        </div>
      </div>
    </dialog>
  )
}
