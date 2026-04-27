import { JSXElement, createSignal, Show, Match, Switch } from 'solid-js'
import { Navigate, useNavigate, useSearchParams, A } from '@solidjs/router'
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
import { Button } from '../components/Button'
import { AuthFormField } from '../components/AuthFormField'
import { MarketingAuthLayout } from '../components/MarketingAuthLayout'
import { FullScreenSpinner } from '../components/Spinner'
import {
  ArrowRightIcon,
  EnvelopeIcon,
  LockIcon,
  ShieldIcon,
} from '../components/auth-icons'
import { createFormState } from '../form_helpers'

export function LoginPage(): JSXElement {
  const { user, loading } = useUser()
  const [searchParams] = useSearchParams()
  const redirectTo = () => (searchParams.redirect as string) || '/home'

  return (
    <Switch>
      <Match when={loading()}>
        <FullScreenSpinner />
      </Match>
      <Match when={user()}>
        <Navigate href={redirectTo()} />
      </Match>
      <Match when={!user()}>
        <LoginForm />
      </Match>
    </Switch>
  )
}

function LoginForm(): JSXElement {
  const { t } = useLocale()
  const { setUser } = useUser()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const redirectTo = () => (searchParams.redirect as string) || '/home'

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
      navigate(redirectTo())
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
      navigate(redirectTo())
    },
  })

  const registerHref = () =>
    searchParams.redirect
      ? `/register?redirect=${encodeURIComponent(searchParams.redirect as string)}`
      : '/register'

  return (
    <MarketingAuthLayout
      topbarRight={
        <A href={registerHref()} class="register-topbar-link">
          {t('dont_have_an_account')} <strong>{t('sign_up')} →</strong>
        </A>
      }
      headline={
        <>
          {t('login_headline_line1')}
          <br />
          {t('login_headline_line2')}{' '}
          <em>{t('login_headline_line2_accent')}</em>
        </>
      }
      subtitle={t('login_subtitle')}
      formPanel={
        <>
          <Show when={!at2FAStep()}>
            <h2 class="register-form-title">{t('login_form_title')}</h2>
            <p class="register-form-subtitle">{t('login_form_subtitle')}</p>

            <Login.Form onSubmit={onLoginSubmit}>
              <div class="register-form">
                <Login.Field
                  name="email"
                  validate={[
                    required(t('please_enter_your_email')),
                    email(t('please_enter_a_valid_email')),
                  ]}
                >
                  {(field, props) => (
                    <AuthFormField
                      label={t('login_email_label')}
                      icon={<EnvelopeIcon />}
                      error={field.error}
                      inputProps={{
                        ...props,
                        'data-cy': 'login-email',
                        type: 'email',
                        value: field.value || '',
                        placeholder: t('email_placeholder'),
                        autocomplete: 'email',
                      }}
                    />
                  )}
                </Login.Field>

                <Login.Field name="password">
                  {(field, props) => (
                    <AuthFormField
                      label={t('login_password_label')}
                      icon={<LockIcon />}
                      error={field.error}
                      inputProps={{
                        ...props,
                        'data-cy': 'login-password',
                        type: 'password',
                        value: field.value || '',
                        placeholder: t('password'),
                        autocomplete: 'current-password',
                      }}
                    />
                  )}
                </Login.Field>

                <div class="login-password-extras">
                  <A href="/forgot-password" class="login-forgot-link">
                    {t('forgot_password')}
                  </A>
                </div>

                <Show when={loginState.response.status === 'error'}>
                  <Alert
                    data-cy="login-error"
                    type="error"
                    message={loginState.response.message}
                  />
                </Show>

                <Button
                  dataCy="login-button"
                  class="register-btn-submit"
                  type="submit"
                  isLoading={loginState.submitting}
                  label={
                    <Show when={!loginState.submitting}>
                      {t('login')}
                      <ArrowRightIcon />
                    </Show>
                  }
                />
              </div>
            </Login.Form>

            <div class="register-signin-link">
              {t('dont_have_an_account')}{' '}
              <A href={registerHref()}>{t('sign_up')}</A>
            </div>
          </Show>

          <Show when={at2FAStep()}>
            <h2 class="register-form-title">{t('login_form_title')}</h2>
            <p class="register-form-subtitle">
              {t('enter_the_6_digit_code_generated_by_your_authenticator_app')}
            </p>

            <Totp.Form onSubmit={onTotpSubmit}>
              <div class="register-form">
                <Totp.Field
                  name="totpCode"
                  validate={[
                    required(t('please_enter_a_6_digit_code')),
                    pattern(
                      /^[0-9]{6}$/,
                      t('please_enter_a_valid_6_digit_code')
                    ),
                  ]}
                >
                  {(field, props) => (
                    <AuthFormField
                      icon={<ShieldIcon />}
                      error={field.error}
                      inputProps={{
                        ...props,
                        type: 'text',
                        value: field.value || '',
                        placeholder: '000000',
                        autocomplete: 'one-time-code',
                      }}
                    />
                  )}
                </Totp.Field>

                <Show when={totpState.response.status === 'error'}>
                  <Alert type="error" message={totpState.response.message} />
                </Show>

                <Button
                  class="register-btn-submit"
                  type="submit"
                  isLoading={totpState.submitting}
                  label={
                    <Show when={!totpState.submitting}>
                      {t('login')}
                      <ArrowRightIcon />
                    </Show>
                  }
                />

                <Button
                  class="login-back-btn"
                  onClick={() => {
                    setAt2FAStep(false)
                    reset(loginState)
                    reset(totpState)
                  }}
                  label={`← ${t('back')}`}
                />
              </div>
            </Totp.Form>
          </Show>
        </>
      }
    />
  )
}
