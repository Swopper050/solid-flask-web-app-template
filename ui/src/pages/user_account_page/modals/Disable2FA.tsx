import { JSXElement, Show } from 'solid-js'
import { disable2FA, Disable2FAData } from '../../../api'
import { useUser } from '../../../context/UserProvider'
import { useLocale } from '../../../context/LocaleProvider'

import { required, pattern } from '@modular-forms/solid'

import { Alert } from '../../../components/Alert'
import { Modal, ModalBaseProps } from '../../../components/Modal'
import { TextInput } from '../../../components/TextInput'
import { Button } from '../../../components/Button'
import { createFormState } from '../../../form_helpers'

export function Disable2FAModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()
  const { fetchUser } = useUser()

  const {
    state,
    onSubmit,
    components: { Form, Field },
  } = createFormState<Disable2FAData>({
    action: disable2FA,
    onFinish: () => {
      fetchUser()
      props.onClose()
    },
  })

  return (
    <Modal
      title={t('disable_2fa')}
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <div>
        <p class="py-4">
          {t('enter_the_6_digit_code_generated_by_your_authenticator_app')}
        </p>

        <Form onSubmit={onSubmit}>
          <Field
            name="totpCode"
            validate={[
              required(t('please_enter_a_6_digit_code')),
              pattern(/^[0-9]{6}$/, t('please_enter_a_valid_6_digit_code')),
            ]}
          >
            {(field, props) => (
              <TextInput
                {...props}
                type="text"
                value={field.value}
                error={field.error}
                icon={<i class="fa-solid fa-hashtag" />}
              />
            )}
          </Field>

          <Show when={state.response.status === 'error'}>
            <Alert type="error" message={state.response.message} />
          </Show>

          <div class="modal-action">
            <Button
              label={t('disable_2fa')}
              type="submit"
              color="primary"
              isLoading={state.submitting}
            />
          </div>
        </Form>
      </div>
    </Modal>
  )
}
