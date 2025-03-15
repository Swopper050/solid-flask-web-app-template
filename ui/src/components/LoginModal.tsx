import { JSXElement, createSignal, Show } from 'solid-js'
import { useNavigate, A } from '@solidjs/router'

import {
  clearResponse,
  createForm,
  reset,
  pattern,
  email,
  required,
  setResponse,
  SubmitHandler,
} from '@modular-forms/solid'

import { getErrorMessage, passwordLogin, totpLogin } from '../api'

import { User } from '../models/User'
import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { Alert } from './Alert'
import { TextInput } from './TextInput'
import { Modal, ModalBaseProps } from './Modal'
import { Button } from './Button'

type LoginFormData = {
  email: string
  password: string
}

type TotpFormData = {
  totpCode: string
}

export function LoginModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()
  const { setUser } = useUser()

  const [currentEmail, setCurrentEmail] = createSignal<string | null>(null)
  const [loginForm, Login] = createForm<LoginFormData>()
  const [totpForm, Totp] = createForm<TotpFormData>()

  const [at2FAStep, setAt2FAStep] = createSignal(false)

  const navigate = useNavigate()

  let loginModalRef: HTMLDialogElement | undefined

  const onPasswordLogin: SubmitHandler<LoginFormData> = async (values) => {
    const response = await passwordLogin(values.email, values.password)

    if (response.status !== 200) {
      setResponse(loginForm, {
        status: 'error',
        message: t(await getErrorMessage(response)),
      })
      return
    }

    const data = await response.json()
    const user = new User(data)
    setResponse(loginForm, { status: 'success', data: data })
    setCurrentEmail(values.email)

    if (user.twoFactorEnabled) {
      setAt2FAStep(true)
    } else {
      setUser(user)
      loginModalRef?.close()
      onClose()
      navigate('/home')
    }
  }

  const onTotpLogin: SubmitHandler<TotpFormData> = async (values) => {
    const response = await totpLogin(currentEmail() ?? '', values.totpCode)

    if (response.status !== 200) {
      setResponse(totpForm, {
        status: 'error',
        message: (await response.json()).error_message,
      })
      return
    }

    const data = await response.json()
    const user = new User(data)
    setResponse(loginForm, { status: 'success', data: data })

    setUser(user)
    loginModalRef?.close()
    onClose()
    navigate('/home')
  }

  const onClose = () => {
    clearResponse(loginForm)
    clearResponse(totpForm)
    reset(loginForm)
    reset(totpForm)
    setAt2FAStep(false)
  }

  return (
    <Modal
      title={t('login')}
      isOpen={props.isOpen}
      onClose={() => {
        onClose()
        props.onClose()
      }}
    >
      <Login.Form onSubmit={onPasswordLogin} class="w-full">
        <div class="space-y-4">
          <Login.Field
            name="email"
            validate={[
              required(t('please_enter_your_email')),
              email(t('please_enter_a_valid_email')),
            ]}
          >
            {(field, props) => (
              <TextInput
                {...props}
                type="email"
                value={field.value}
                error={field.error}
                placeholder={t('email_placeholder')}
                icon={<i class="fa-solid fa-envelope" />}
                disabled={at2FAStep()}
              />
            )}
          </Login.Field>

          <Login.Field name="password">
            {(field, props) => (
              <TextInput
                {...props}
                type="password"
                value={field.value}
                error={field.error}
                placeholder={t('password')}
                icon={<i class="fa-solid fa-key" />}
                disabled={at2FAStep()}
              />
            )}
          </Login.Field>

          <Show when={loginForm.response.status === 'error'}>
            <Alert type="error" message={loginForm.response.message} />
          </Show>

          <Show when={!at2FAStep()}>
            <A
              class="flex justify-center text-primary mt-4"
              href="/forgot-password"
            >
              {t('forgot_password')}
            </A>

            <div class="modal-action">
              <Button
                label={t('login')}
                type="submit"
                color="primary"
                class="w-full"
                isLoading={loginForm.submitting}
              />
            </div>
          </Show>
        </div>
      </Login.Form>

      <Show when={at2FAStep()}>
        <div class="divider text-center mt-4" />

        <p class="pb-4">
          {t('enter_the_6_digit_code_generated_by_your_authenticator_app')}
        </p>

        <Totp.Form onSubmit={onTotpLogin}>
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
              />
            )}
          </Totp.Field>

          <Show when={loginForm.response.status === 'error'}>
            <Alert type="error" message={loginForm.response.message} />
          </Show>

          <div class="modal-action">
            <Button
              label={t('login')}
              isLoading={totpForm.submitting}
              color="primary"
              type="submit"
            />
          </div>
        </Totp.Form>
      </Show>
    </Modal>
  )
}
