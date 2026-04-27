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
import { createFormState } from '../form_helpers'

export function LoginPage(): JSXElement {
  const { user, loading } = useUser()
  const [searchParams] = useSearchParams()
  const redirectTo = () => (searchParams.redirect as string) || '/home'

  return (
    <Switch>
      <Match when={loading()}>
        <div class="flex items-center justify-center min-h-screen">
          <span class="loading loading-ball loading-lg text-primary" />
        </div>
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
    <div class="register-page">
      <div class="register-topbar">
        <A href="/login" class="register-logo">
          <div class="register-logo-mark">
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
              <rect
                width="64"
                height="64"
                rx="14"
                fill="var(--color-primary)"
              />
              <polygon
                points="32,12 20,36 30,36 28,52 44,28 34,28"
                fill="white"
              />
            </svg>
          </div>
          <span class="register-logo-text">{t('my_solid_app')}</span>
        </A>

        <A href={registerHref()} class="register-topbar-link">
          {t('dont_have_an_account')} <strong>{t('sign_up')} →</strong>
        </A>
      </div>

      <div class="register-main">
        <div class="register-split">
          <div class="register-left">
            <div class="register-left-inner">
              <h1 class="register-left-headline">
                {t('login_headline_line1')}
                <br />
                {t('login_headline_line2')}{' '}
                <em>{t('login_headline_line2_accent')}</em>
              </h1>
              <p class="register-left-sub">{t('login_subtitle')}</p>
            </div>
          </div>

          <div class="register-right">
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
                      <div class="register-field">
                        <label class="register-field-label">
                          {t('login_email_label')}
                        </label>
                        <div class="register-input-wrap">
                          <span class="register-input-icon">
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          </span>
                          <input
                            {...props}
                            data-cy="login-email"
                            type="email"
                            class={field.error ? 'register-input-error' : ''}
                            value={field.value || ''}
                            placeholder={t('email_placeholder')}
                            autocomplete="email"
                          />
                        </div>
                        <Show when={field.error}>
                          <div class="register-field-error">{field.error}</div>
                        </Show>
                      </div>
                    )}
                  </Login.Field>

                  <Login.Field name="password">
                    {(field, props) => (
                      <div class="register-field">
                        <label class="register-field-label">
                          {t('login_password_label')}
                        </label>
                        <div class="register-input-wrap">
                          <span class="register-input-icon">
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                              />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </span>
                          <input
                            {...props}
                            data-cy="login-password"
                            type="password"
                            class={field.error ? 'register-input-error' : ''}
                            value={field.value || ''}
                            placeholder={t('password')}
                            autocomplete="current-password"
                          />
                        </div>
                        <Show when={field.error}>
                          <div class="register-field-error">{field.error}</div>
                        </Show>
                      </div>
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
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
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
                {t(
                  'enter_the_6_digit_code_generated_by_your_authenticator_app'
                )}
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
                      <div class="register-field">
                        <div class="register-input-wrap">
                          <span class="register-input-icon">
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                          </span>
                          <input
                            {...props}
                            type="text"
                            class={field.error ? 'register-input-error' : ''}
                            value={field.value || ''}
                            placeholder="000000"
                            autocomplete="one-time-code"
                          />
                        </div>
                        <Show when={field.error}>
                          <div class="register-field-error">{field.error}</div>
                        </Show>
                      </div>
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
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
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
          </div>
        </div>
      </div>
    </div>
  )
}
