import { JSXElement, createSignal, Show } from 'solid-js'
import { useNavigate, A } from '@solidjs/router'

import { pattern, email, required, setValue } from '@modular-forms/solid'

import {
  passwordLogin,
  PasswordLoginData,
  totpLogin,
  TotpLoginData,
} from '../api'

import { User, UserAttributes } from '../models/User'
import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { Alert } from './Alert'
import { TextInput } from './TextInput'
import { Modal, ModalBaseProps } from './Modal'
import { Button } from './Button'
import { createFormWithSubmit } from '../form_helpers'

export function LoginModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()
  const { setUser } = useUser()

  const [at2FAStep, setAt2FAStep] = createSignal(false)
  const [closed, setClose] = createSignal(false)

  const navigate = useNavigate()

  const [loginForm, onLoginSubmit, Login] = createFormWithSubmit<
    PasswordLoginData,
    UserAttributes
  >({
    action: passwordLogin,
    onFinish: (response) => {
      if (response === undefined) {
        return
      }
      const user = new User(response)

      if (user.twoFactorEnabled) {
        setAt2FAStep(true)
        setValue(totpForm, 'email', user.email)

        return
      }

      setUser(user)
      setClose(true)
      navigate('/home')
    },
  })

  const [totpForm, onTotpSubmit, Totp] = createFormWithSubmit<
    TotpLoginData,
    UserAttributes
  >({
    action: totpLogin,
    onFinish: (response) => {
      if (response === undefined) {
        return
      }
      const user = new User(response)

      setUser(user)
      setClose(true)
      navigate('/home')
    },
  })

  return (
    <Modal
      title={t('login')}
      isOpen={props.isOpen && !closed()}
      onClose={() => {
        props.onClose()
      }}
    >
      <Login.Form onSubmit={onLoginSubmit} class="w-full">
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

        <Totp.Form onSubmit={onTotpSubmit}>
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
