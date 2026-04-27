import { JSXElement, createSignal } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import { useUser } from '../../../context/UserProvider'
import { useLocale } from '../../../context/LocaleProvider'
import { deleteAccount } from '../../../api'
import { ConfirmModal } from '../../../components/ConfirmModal'
import { ModalBaseProps } from '../../../components/Modal'

export function DeleteAccountModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()
  const { setUser } = useUser()
  const navigate = useNavigate()

  const [submitting, setSubmitting] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  const handleConfirm = async () => {
    setError(null)
    setSubmitting(true)
    const response = await deleteAccount()
    setSubmitting(false)
    if (response.status !== 200) {
      setError(t('an_unknown_error_occurred'))
      return
    }
    setUser(null)
    navigate('/home')
  }

  return (
    <ConfirmModal
      title={t('delete_account')}
      isOpen={props.isOpen}
      onClose={props.onClose}
      confirmLabel={t('delete_account')}
      confirmColor="error"
      confirmDataCy="confirm-delete-account"
      isLoading={submitting()}
      errorMessage={error()}
      onConfirm={handleConfirm}
    >
      <p class="py-4">{t('are_you_sure_you_want_to_delete_your_account')}</p>
      <p>{t('this_action_cannot_be_undone')}</p>
    </ConfirmModal>
  )
}
