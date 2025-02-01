import { createSignal, JSXElement, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { useUser } from '../../context/UserProvider'
import { useLocale } from '../../context/LocaleProvider'
import { clsx } from 'clsx'

import { deleteAccount } from '../../api'
import { Modal, ModalBaseProps } from '../../components/Modal'
import { Alert } from '../../components/Alert'

export function DeleteAccountModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()
  const { setUser } = useUser()

  const [deleting, setDeleting] = createSignal(false)
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)

  const navigate = useNavigate()

  const onDeleteAccount = async () => {
    setDeleting(true)
    setErrorMsg(null)

    const response = await deleteAccount()
    if (response.status !== 200) {
      setErrorMsg(
        (await response.json()).error_message ?? 'Could not delete account'
      )
      setDeleting(false)
      return
    }

    setUser(null)
    setDeleting(false)
    navigate('/home')
  }

  return (
    <Modal
      title={t('delete_account')}
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <p class="py-4">{t('are_you_sure_you_want_to_delete_your_account')}</p>
      <p>{t('this_action_cannot_be_undone')}</p>

      <Show when={errorMsg() !== null}>
        <Alert type="error" message={errorMsg()} />
      </Show>

      <div class="modal-action">
        <form method="dialog">
          <button
            class={clsx('btn mr-2', deleting() && 'btn-disabled')}
            onClick={() => props.onClose()}
          >
            {t('cancel')}
          </button>
        </form>

        <button
          class={clsx('btn btn-error', deleting() && 'btn-disabled')}
          onClick={onDeleteAccount}
        >
          {t('delete_account')}
          <Show when={deleting()}>
            <span class="loading loading-ball" />
          </Show>
        </button>
      </div>
    </Modal>
  )
}
