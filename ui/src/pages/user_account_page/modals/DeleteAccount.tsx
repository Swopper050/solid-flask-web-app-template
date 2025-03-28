import { JSXElement, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { useUser } from '../../../context/UserProvider'
import { useLocale } from '../../../context/LocaleProvider'

import { deleteAccount } from '../../../api'
import { Modal, ModalBaseProps } from '../../../components/Modal'
import { Alert } from '../../../components/Alert'
import { Button } from '../../../components/Button'
import { createFormState } from '../../../form_helpers'

export function DeleteAccountModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()
  const { setUser } = useUser()

  const navigate = useNavigate()

  const {
    state,
    onSubmit,
    components: { Form },
  } = createFormState({
    action: deleteAccount,
    onFinish: () => {
      setUser(null)
      navigate('/home')
    },
  })

  return (
    <Modal
      title={t('delete_account')}
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <p class="py-4">{t('are_you_sure_you_want_to_delete_your_account')}</p>
      <p>{t('this_action_cannot_be_undone')}</p>

      <Show when={state.response.status === 'error'}>
        <Alert type="error" message={state.response.message} />
      </Show>

      <Form onSubmit={onSubmit}>
        <div class="modal-action">
          <Button
            label={t('cancel')}
            onClick={() => props.onClose()}
            color="secondary"
            isLoading={state.submitting}
          />

          <Button
            label={t('delete_account')}
            type="submit"
            color="error"
            isLoading={state.submitting}
          />
        </div>
      </Form>
    </Modal>
  )
}
