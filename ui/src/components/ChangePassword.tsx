import { createSignal, JSXElement, Show } from 'solid-js'
import { useUser } from '../context'
import { clsx } from 'clsx'

import api from '../api'
import { PasswordIcon } from './icons/Password'
import { User } from '../models/User'

export function ChangePassword(): JSXElement {
  const { setUser } = useUser()
  const [changingPassword, setChangingPassword] = createSignal(false)
  const [currentPassword, setCurrentPassword] = createSignal<string | null>(
    null
  )
  const [newPassword, setNewPassword] = createSignal<string | null>(null)
  const [confirmNewPassword, setConfirmNewPassword] = createSignal<
    string | null
  >(null)
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)
  const [successMsg, setSuccessMsg] = createSignal<string | null>(null)
  const [submitting, setSubmitting] = createSignal(false)

  const canChangePassword = () => {
    return (
      currentPassword() !== null &&
      newPassword() !== null &&
      newPassword() === confirmNewPassword()
    )
  }

  const changePassword = () => {
    setSubmitting(true)
    setErrorMsg(null)

    api
      .post(
        '/change_password',
        JSON.stringify({
          current_password: currentPassword(),
          new_password: newPassword(),
        })
      )
      .then((response) => {
        setUser(new User(response.data))
        setChangingPassword(false)
        setSuccessMsg('Password changed successfully')
        setTimeout(() => setSuccessMsg(null), 5000)
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
      <div class="flex items-center mt-6">
        <button
          class="btn btn-primary"
          onClick={() => setChangingPassword(!changingPassword())}
        >
          Change password
        </button>

        <Show when={successMsg() !== null}>
          <p class="text-base text-success ml-6">
            <i class="fa-solid fa-check mr-2" />
            {successMsg()}
          </p>
        </Show>
      </div>

      <Show when={changingPassword()}>
        <div class="w-80 my-2">
          <label class="input input-bordered flex items-center my-2">
            <PasswordIcon />
            <input
              type="password"
              class="grow ml-2"
              placeholder="Current password"
              value={currentPassword()}
              onInput={(e) =>
                setCurrentPassword(
                  e.target.value === '' ? null : e.target.value
                )
              }
            />
          </label>

          <label class="input input-bordered flex items-center my-2">
            <PasswordIcon />
            <input
              type="password"
              class="grow ml-2"
              placeholder="New password"
              value={newPassword()}
              onInput={(e) =>
                setNewPassword(e.target.value === '' ? null : e.target.value)
              }
            />
          </label>

          <label class="input input-bordered flex items-center my-2">
            <PasswordIcon />
            <input
              type="password"
              class="grow ml-2"
              placeholder="New password"
              value={confirmNewPassword()}
              onInput={(e) =>
                setConfirmNewPassword(
                  e.target.value === '' ? null : e.target.value
                )
              }
            />
          </label>

          <Show when={errorMsg() !== null}>
            <div role="alert" class="alert alert-error my-6">
              <span>{errorMsg()}</span>
            </div>
          </Show>

          <div>
            <button
              class={clsx(
                'btn',
                'btn-primary',
                (submitting() || !canChangePassword()) && 'btn-disabled'
              )}
              onClick={changePassword}
            >
              <Show when={submitting()}>
                <span class="loading loading-spinner" />
              </Show>
              Save
            </button>
          </div>
        </div>
      </Show>
    </>
  )
}
