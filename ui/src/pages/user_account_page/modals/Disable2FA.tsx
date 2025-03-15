import { JSXElement, Show } from 'solid-js'
import { disable2FA, getErrorMessage } from '../../../api'
import { useUser } from '../../../context/UserProvider'
import { useLocale } from '../../../context/LocaleProvider'

import {
  required,
  pattern,
  createForm,
  clearResponse,
  reset,
  setResponse,
  SubmitHandler,
} from '@modular-forms/solid'

import { Alert } from '../../../components/Alert'
import { Modal, ModalBaseProps } from '../../../components/Modal'
import { TextInput } from '../../../components/TextInput'
import { Button } from '../../../components/Button'

type TotpFormData = {
  totpCode: string
}

export function Disable2FAModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()
  const { fetchUser } = useUser()

  const [totpForm, Totp] = createForm<TotpFormData>()

  const onDisable2FA: SubmitHandler<TotpFormData> = async (values) => {
    const response = await disable2FA(values.totpCode)

    if (response.status !== 200) {
      setResponse(totpForm, {
        status: 'error',
        message: t(await getErrorMessage(response)),
      })
      return
    }

    await fetchUser()
    setResponse(totpForm, { status: 'success' })

    onClose()
    props.onClose()
  }

  const onClose = () => {
    clearResponse(totpForm)
    reset(totpForm)
  }

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

        <Totp.Form onSubmit={onDisable2FA}>
          <Totp.Field
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
          </Totp.Field>

          <Show when={totpForm.response.status === 'error'}>
            <Alert type="error" message={totpForm.response.message} />
          </Show>

          <div class="modal-action">
            <Button type="submit" isLoading={totpForm.submitting}>
              {t('disable_2fa')}
            </Button>
          </div>
        </Totp.Form>
      </div>
    </Modal>
  )
}
