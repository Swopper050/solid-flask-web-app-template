import { createSignal, JSXElement, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { useUser } from '../../context'
import { clsx } from 'clsx'

import api from '../../api'
import { Modal, ModalBaseProps } from '../../components/Modal'

export function DeleteAccountModal(props: ModalBaseProps): JSXElement {
  const { setUser } = useUser()

  const [deleting, setDeleting] = createSignal(false)
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)

  const navigate = useNavigate()

  const deleteAccount = async () => {
    setDeleting(true)
    setErrorMsg(null)

    api
      .delete('/delete_account')
      .then(() => {
        setUser(null)
        navigate('/home')
      })
      .catch((error) => {
        setErrorMsg(
          error.response.data.error_message ?? 'Could not delete account'
        )
      })
      .finally(() => {
        setDeleting(false)
      })
  }

  return (
    <Modal
      title="Deleting account"
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <p class="py-4">Are you sure you want to delete your account?</p>
      <p>This action cannot be undone.</p>

      <Show when={errorMsg() !== null}>
        <div role="alert" class="alert alert-error my-6">
          <span>{errorMsg()}</span>
        </div>
      </Show>

      <div class="modal-action">
        <form method="dialog">
          <button
            class={clsx('btn mr-2', deleting() && 'btn-disabled')}
            onClick={() => props.onClose()}
          >
            Cancel
          </button>
        </form>

        <button
          class={clsx('btn btn-error', deleting() && 'btn-disabled')}
          onClick={deleteAccount}
        >
          <Show when={deleting()}>
            <span class="loading loading-ball" />
          </Show>
          Delete
        </button>
      </div>
    </Modal>
  )
}
