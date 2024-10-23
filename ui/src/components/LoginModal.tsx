import { JSXElement, createSignal, Show } from 'solid-js'
import { useNavigate, Link } from '@solidjs/router'
import { clsx } from 'clsx'

import { EmailIcon } from './icons/Email'
import { PasswordIcon } from './icons/Password'
import api from '../api'

import { User } from '../models/User'
import { useUser } from '../context'

export function LoginModal(): JSXElement {
  const { setUser } = useUser()
  const [email, setEmail] = createSignal<string | null>(null)
  const [password, setPassword] = createSignal<string | null>(null)
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)
  const [submitting, setSubmitting] = createSignal(false)

  const navigate = useNavigate()

  let loginModalRef: HTMLDialogElement | undefined

  const formReady = () => {
    return email() !== null && password() !== null
  }

  const handleLogin = async () => {
    setSubmitting(true)

    api
      .post('/login', JSON.stringify({ email: email(), password: password() }))
      .then((response) => {
        setUser(new User(response.data))
        loginModalRef?.close()
        navigate('/home')
      })
      .catch((error) => {
        setErrorMsg(error.response.data.error_message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <dialog ref={loginModalRef} id="login_modal" class="modal">
      <div class="modal-box">
        <h3 class="flex justify-center text-lg font-bold mb-6">Login</h3>

        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>

        <label class="input input-bordered flex items-center gap-2 mb-3">
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

        <label class="input input-bordered flex items-center gap-2">
          <PasswordIcon />
          <input
            type="password"
            class="grow"
            placeholder="Your password"
            value={password()}
            onInput={(e) =>
              setPassword(e.target.value === '' ? null : e.target.value)
            }
          />
        </label>

        <Link
          class="flex justify-center text-primary mt-4"
          href="/forgot-password"
        >
          Forgot password?
        </Link>

        <Show when={errorMsg() !== null}>
          <div role="alert" class="alert alert-error my-6">
            <span>{errorMsg()}</span>
          </div>
        </Show>

        <div class="modal-action flex justify-center">
          <button
            class={clsx(
              'btn',
              'btn-primary',
              (submitting() || !formReady()) && 'btn-disabled'
            )}
            onClick={handleLogin}
          >
            <Show when={submitting()}>
              <span class="loading loading-spinner" />
            </Show>
            Login
          </button>
        </div>
      </div>
    </dialog>
  )
}
