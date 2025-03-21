import { createSignal, onMount, JSXElement, Show } from 'solid-js'
import { enable2FA, Enable2FAData, generate2FASecret } from '../../../api'
import { useUser } from '../../../context/UserProvider'
import { useLocale } from '../../../context/LocaleProvider'

import { required, pattern } from '@modular-forms/solid'

import { Alert } from '../../../components/Alert'
import { Modal, ModalBaseProps } from '../../../components/Modal'
import { TextInput } from '../../../components/TextInput'
import { Button } from '../../../components/Button'
import { createFormState } from '../../../form_helpers'

export function Enable2FAModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()
  const { fetchUser } = useUser()

  const [qrCode, setQrCode] = createSignal('')

  const {
    state,
    onSubmit,
    setter: setTotpSecret,
    components: { Form, Field },
  } = createFormState<Enable2FAData>({
    action: enable2FA,
    onFinish: () => {
      fetchUser()
      props.onClose()
    },
  })

  const fetchQRCode = async () => {
    const response = await generate2FASecret()
    const data = await response.json()
    setQrCode(data.qr_code)
    setTotpSecret({ totpSecret: data.totp_secret })
  }

  onMount(() => {
    fetchQRCode()
  })

  return (
    <Modal
      title=""
      isOpen={props.isOpen}
      onClose={() => {
        props.onClose()
      }}
    >
      <div>
        <h3 class="font-bold text-lg">
          {t('step_1_scan_qr_code_with_your_authenticator_app')}
        </h3>

        <div class="my-8 flex justify-center">
          <img
            src={`data:image/png;base64,${qrCode()}`}
            alt="TOTP QR Code"
            width="50%"
          />
        </div>

        <div class="flex justify-center">
          <Button
            label={t('regenerate_qr_code')}
            color="primary"
            class="btn-sm btn-outline"
            onClick={() => fetchQRCode()}
            icon="fas fa-undo"
          />
        </div>
      </div>

      <div class="mt-20">
        <h3 class="font-bold text-lg">
          {t('step_2_verify_the_setup_by_filling_in_the_2fa_code')}
        </h3>

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
              label={t('enable_2fa')}
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
