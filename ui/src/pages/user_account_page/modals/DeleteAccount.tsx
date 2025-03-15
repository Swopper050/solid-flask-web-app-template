import { createSignal, JSXElement, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { useUser } from '../../../context/UserProvider'
import { useLocale } from '../../../context/LocaleProvider'

import { deleteAccount, getErrorMessage } from '../../../api'
import { Modal, ModalBaseProps } from '../../../components/Modal'
import { Alert } from '../../../components/Alert'
import { Button } from '../../../components/Button'

export function DeleteAccountModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()
  const { setUser } = useUser()

  const navigate = useNavigate()

  const [deleting, setDeleting] = createSignal(false)
  const [errorMsg, setErrorMsg] = createSignal<string | undefined>(undefined)

  const onDeleteAccount = async () => {
    setDeleting(true)
    setErrorMsg(undefined)

    const response = await deleteAccount()
    if (response.status !== 200) {
      setErrorMsg(t(await getErrorMessage(response)))
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
        <Button
          label={t('cancel')}
          onClick={() => props.onClose()}
          color="secondary"
          isLoading={deleting()}
        />

        <Button
          label={t('delete_account')}
          onClick={() => onDeleteAccount()}
          color="error"
          isLoading={deleting()}
        />
      </div>
    </Modal>
  )
}
