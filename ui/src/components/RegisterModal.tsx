import { JSXElement, createSignal, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { clsx } from 'clsx'

import { EmailIcon } from './icons/Email'
import { PasswordIcon } from './icons/Password'
import api from '../api'

import { useUser } from '../context'
import { User } from '../models/User'

import { isGoodPassword, passwordConditions } from './utils'

import { Modal, ModalBaseProps } from "./Modal"

export function RegisterModal(props: ModalBaseProps): JSXElement {
  const { setUser } = useUser()
  const [email, setEmail] = createSignal<string | null>(null)
  const [password, setPassword] = createSignal<string | null>(null)
  const [checkPassword, setCheckPassword] = createSignal<string | null>(null)
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)
  const [submitting, setSubmitting] = createSignal(false)

  const navigate = useNavigate()

  let registerModalRef: HTMLDialogElement | undefined

  const passwordsMatch = () => {
    return password() === checkPassword()
  }

  const formReady = () => {
    return (
      email() !== null &&
      passwordsMatch() &&
      password() !== null &&
      isGoodPassword(password())
    )
  }

  const handleLogin = async () => {
    setSubmitting(true)

    api
      .post(
        '/register',
        JSON.stringify({ email: email(), password: password() })
      )
      .then((response) => {
        setUser(new User(response.data))
        registerModalRef?.close()
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
    <Modal
      title="Register"
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
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

      <label
        class={clsx(
          'input input-bordered flex items-center gap-2',
          password() !== null && !isGoodPassword(password()) && 'input-error'
        )}
      >
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
      <Show when={password() !== null && !isGoodPassword(password())}>
        <div class="label">
          <span class="label-text-alt text-error">
            {passwordConditions()}
          </span>
        </div>
      </Show>

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
          placeholder="Confirm password"
          value={checkPassword()}
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
          Register
        </button>
      </div>
    </Modal>
  )
}
