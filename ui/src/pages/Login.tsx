import { JSXElement, createSignal, Show } from 'solid-js'
import { useNavigate, A } from '@solidjs/router'
import { pattern, email, required, reset } from '@modular-forms/solid'

import {
  passwordLogin,
  PasswordLoginData,
  totpLogin,
  TotpLoginData,
} from '../api'
import { User, UserAttributes } from '../models/User'
import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { Alert } from '../components/Alert'
import { TextInput } from '../components/TextInput'
import { Button } from '../components/Button'
import { AuthCard } from '../components/AuthCard'
import { createFormState } from '../form_helpers'

export function LoginPage(): JSXElement {
  const { t } = useLocale()
  const { setUser } = useUser()
  const navigate = useNavigate()

  const [at2FAStep, setAt2FAStep] = createSignal(false)

  const {
    state: loginState,
    onSubmit: onLoginSubmit,
    components: Login,
  } = createFormState<PasswordLoginData, UserAttributes>({
    action: passwordLogin,
    onFinish: (response) => {
      if (response === undefined) return

      const user = new User(response)
      if (user.twoFactorEnabled) {
        setAt2FAStep(true)
        setEmail({ email: user.email })
        return
      }

      setUser(user)
      navigate('/home')
    },
  })

  const {
    state: totpState,
    setter: setEmail,
    onSubmit: onTotpSubmit,
    components: Totp,
  } = createFormState<TotpLoginData, UserAttributes>({
    action: totpLogin,
    onFinish: (response) => {
      if (response === undefined) return
      setUser(new User(response))
      navigate('/home')
    },
  })

  return (
    <AuthCard title={t('welcome_back')} subtitle={t('sign_in_to_your_account')}>
      <Show when={!at2FAStep()}>
        <Login.Form onSubmit={onLoginSubmit}>
          <div class="space-y-1">
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
                />
              )}
            </Login.Field>

            <Show when={loginState.response.status === 'error'}>
              <Alert type="error" message={loginState.response.message} />
            </Show>

            <div class="flex justify-end">
              <A class="text-xs text-primary mt-1" href="/forgot-password">
                {t('forgot_password')}
              </A>
            </div>

            <Button
              label={t('login')}
              type="submit"
              color="primary"
              class="w-full mt-2"
              isLoading={loginState.submitting}
            />
          </div>
        </Login.Form>
      </Show>

      <Show when={at2FAStep()}>
        <p class="text-sm text-base-content/70 mb-4">
          {t('enter_the_6_digit_code_generated_by_your_authenticator_app')}
        </p>

        <Totp.Form onSubmit={onTotpSubmit}>
          <div class="space-y-1">
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
                  placeholder="000000"
                  icon={<i class="fa-solid fa-shield" />}
                />
              )}
            </Totp.Field>

            <Show when={totpState.response.status === 'error'}>
              <Alert type="error" message={totpState.response.message} />
            </Show>

            <Button
              label={t('login')}
              isLoading={totpState.submitting}
              color="primary"
              type="submit"
              class="w-full mt-2"
            />

            <button
              type="button"
              class="w-full text-xs text-base-content/50 mt-2 hover:text-base-content/70 transition-colors"
              onClick={() => {
                setAt2FAStep(false)
                reset(loginState)
                reset(totpState)
              }}
            >
              ← {t('back_to_home')}
            </button>
          </div>
        </Totp.Form>
      </Show>

      <div class="divider my-4 text-base-content/30 text-xs">{t('or')}</div>

      <p class="text-xs text-base-content/50 text-center">
        {t('dont_have_an_account')}{' '}
        <A class="text-primary font-medium" href="/register">
          {t('sign_up')}
        </A>
      </p>
    </AuthCard>
  )
}
