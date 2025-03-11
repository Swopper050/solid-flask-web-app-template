import { createSignal, onMount, JSXElement, Show } from 'solid-js'
import { enable2FA, generate2FASecret, getErrorMessage } from '../../api'
import { clsx } from 'clsx'
import { useUser } from '../../context/UserProvider'
import { useLocale } from '../../context/LocaleProvider'

import {
  required,
  pattern,
  createForm,
  clearResponse,
  reset,
  setResponse,
  SubmitHandler,
} from '@modular-forms/solid'

import { Alert } from '../../components/Alert'
import { Modal, ModalBaseProps } from '../../components/Modal'
import { TextInput } from '../../components/TextInput'

type TotpFormData = {
  totpCode: string
}

export function Enable2FAModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()
  const { fetchUser } = useUser()

  const [totpSecret, setTotpSecret] = createSignal<string | null>(null)
  const [qrCode, setQrCode] = createSignal<string | null>(null)

  const [totpForm, Totp] = createForm<TotpFormData>()

  const fetchQRCode = async () => {
    const response = await generate2FASecret()
    const data = await response.json()
    setQrCode(data.qr_code)
    setTotpSecret(data.totp_secret)
  }

  const onEnable2FA: SubmitHandler<TotpFormData> = async (values) => {
    const response = await enable2FA(totpSecret(), values.totpCode)

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

  onMount(() => {
    fetchQRCode()
  })

  const onClose = () => {
    clearResponse(totpForm)
    reset(totpForm)
  }

  return (
    <Modal
      title=""
      isOpen={props.isOpen}
      onClose={() => {
        onClose()
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
          <button
            class="btn btn-primary btn-sm btn-outline"
            onClick={fetchQRCode}
          >
            <i class="fas fa-undo mr-2" />
            {t('regenerate_qr_code')}
          </button>
        </div>
      </div>

      <div class="mt-20">
        <h3 class="font-bold text-lg">
          {t('step_2_verify_the_setup_by_filling_in_the_2fa_code')}
        </h3>
        <p class="py-4">
          {t('enter_the_6_digit_code_generated_by_your_authenticator_app')}
        </p>

        <Totp.Form onSubmit={onEnable2FA}>
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
            <button
              class={clsx(
                'btn btn-primary',
                totpForm.submitting && 'btn-disabled'
              )}
              type="submit"
            >
              {t('enable_2fa')}
              <Show when={totpForm.submitting}>
                <span class="loading loading-ball" />
              </Show>
            </button>
          </div>
        </Totp.Form>
      </div>
    </Modal>
  )
}
