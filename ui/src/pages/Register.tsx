import {
  JSXElement,
  Show,
  For,
  Match,
  Switch,
  createMemo,
  createResource,
} from 'solid-js'
import { Navigate, useNavigate, useSearchParams, A } from '@solidjs/router'
import { minLength, pattern, email, required } from '@modular-forms/solid'

import { register, RegisterUserData, lookupInvitation } from '../api'
import { User, UserAttributes } from '../models/User'
import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { useWorkspace } from '../context/WorkspaceProvider'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { createFormState } from '../form_helpers'
import { mustMatch } from '../validators'

function PasswordStrengthBar(props: { value: string | undefined }) {
  const score = createMemo(() => {
    const val = props.value || ''
    let s = 0
    if (val.length >= 6) s++
    if (val.length >= 10) s++
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) s++
    if (/[^A-Za-z0-9]/.test(val)) s++
    return s
  })

  const cls = () => (score() <= 1 ? 'weak' : score() <= 2 ? 'ok' : 'strong')

  return (
    <div class="register-strength-bar">
      <For each={[0, 1, 2, 3]}>
        {(i) => (
          <div
            class={`register-strength-seg${i < score() ? ` ${cls()}` : ''}`}
          />
        )}
      </For>
    </div>
  )
}

export function RegisterPage(): JSXElement {
  const { user, loading } = useUser()
  const [searchParams] = useSearchParams()

  const invitationToken = () =>
    searchParams.invitation_token as string | undefined

  const acceptHref = () => {
    const tok = invitationToken()
    if (!tok) return '/home'
    return `/accept-invitation?token=${encodeURIComponent(tok)}`
  }

  return (
    <Switch>
      <Match when={loading()}>
        <div class="flex items-center justify-center min-h-screen">
          <span class="loading loading-ball loading-lg text-primary" />
        </div>
      </Match>
      <Match when={user()}>
        <Navigate href={acceptHref()} />
      </Match>
      <Match when={!user()}>
        <RegisterForm />
      </Match>
    </Switch>
  )
}

function RegisterForm(): JSXElement {
  const { t } = useLocale()
  const { setUser } = useUser()
  const { fetchWorkspaces } = useWorkspace()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const invitationToken = () =>
    searchParams.invitation_token as string | undefined

  const [inviteInfo] = createResource(invitationToken, async (token) => {
    if (!token) return null
    return lookupInvitation(token)
  })

  const isInvite = () => !!inviteInfo()
  const redirectTo = () => (searchParams.redirect as string) || '/home'

  const {
    state,
    onSubmit,
    accessor,
    components: { Form, Field },
  } = createFormState<RegisterUserData, UserAttributes>({
    action: (values) =>
      register({ ...values, invitationToken: invitationToken() }),
    onFinish: async (response) => {
      if (response !== undefined) {
        setUser(new User(response))
      }
      await fetchWorkspaces()
      navigate(redirectTo())
    },
  })

  const newPassword = () => accessor().password

  const loginHref = () => {
    if (invitationToken()) {
      const acceptUrl = `/accept-invitation?token=${encodeURIComponent(invitationToken()!)}`
      return `/login?redirect=${encodeURIComponent(acceptUrl)}`
    }
    if (searchParams.redirect) {
      return `/login?redirect=${encodeURIComponent(searchParams.redirect as string)}`
    }
    return '/login'
  }

  return (
    <div class="register-page">
      <div class="register-topbar">
        <A href="/login" class="register-logo">
          <Show
            when={isInvite()}
            fallback={
              <>
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
              </>
            }
          >
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
          </Show>
        </A>

        <Show
          when={isInvite()}
          fallback={
            <A href={loginHref()} class="register-topbar-link">
              {t('already_have_an_account')} <strong>{t('sign_in')} →</strong>
            </A>
          }
        >
          <div class="register-invite-badge">
            <div class="register-invite-badge-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div class="register-invite-badge-text">
              <span class="register-invite-badge-label">
                {t('invite_badge_label')}
              </span>
              <span class="register-invite-badge-workspace">
                {inviteInfo()!.workspace_name}
              </span>
            </div>
          </div>
        </Show>
      </div>

      <div class="register-main">
        <div class="register-split">
          <div class="register-left">
            <div class="register-left-inner">
              <h1 class="register-left-headline">
                <Show
                  when={isInvite()}
                  fallback={
                    <>
                      {t('register_headline_line1')}
                      <br />
                      {t('register_headline_line2')}{' '}
                      <em>{t('register_headline_line2_accent')}</em>
                    </>
                  }
                >
                  {t('invite_headline_line1')}
                  <br />
                  {t('invite_headline_line2')}{' '}
                  <em>{t('invite_headline_line2_accent')}</em>
                </Show>
              </h1>
              <p class="register-left-sub">
                <Show when={isInvite()} fallback={t('register_subtitle')}>
                  {t('invite_subtitle')}
                </Show>
              </p>
            </div>
          </div>

          <div class="register-right">
            <h2 class="register-form-title">
              <Show when={isInvite()} fallback={t('register_create_account')}>
                {t('invite_join_workspace')}
              </Show>
            </h2>

            <Show when={!isInvite()}>
              <div class="register-free-badge">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                <span class="register-free-badge-text">
                  {t('register_free_start')} &mdash;{' '}
                  <span>{t('register_no_credit_card')}</span>
                </span>
              </div>
            </Show>

            <Form onSubmit={onSubmit}>
              <div class="register-form">
                <Field
                  name="name"
                  validate={[required(t('please_enter_your_name'))]}
                >
                  {(field, props) => (
                    <div class="register-field">
                      <label class="register-field-label" for="register-name">
                        {t('name')}
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
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          {...props}
                          id="register-name"
                          data-cy="register-name"
                          type="text"
                          class={field.error ? 'register-input-error' : ''}
                          value={field.value || ''}
                          placeholder={t('name_placeholder')}
                          autocomplete="given-name"
                        />
                      </div>
                      <Show when={field.error}>
                        <div class="register-field-error">{field.error}</div>
                      </Show>
                    </div>
                  )}
                </Field>

                <Field
                  name="email"
                  validate={[
                    required(t('please_enter_your_email')),
                    email(t('please_enter_a_valid_email')),
                  ]}
                >
                  {(field, props) => (
                    <div class="register-field">
                      <label class="register-field-label" for="register-email">
                        {t('register_email_label')}
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
                          id="register-email"
                          data-cy="register-email"
                          type="email"
                          class={field.error ? 'register-input-error' : ''}
                          value={
                            isInvite() ? inviteInfo()!.email : field.value || ''
                          }
                          readonly={isInvite()}
                          placeholder={t('email_placeholder')}
                          autocomplete="email"
                        />
                      </div>
                      <Show when={field.error}>
                        <div class="register-field-error">{field.error}</div>
                      </Show>
                    </div>
                  )}
                </Field>

                <Field
                  name="password"
                  validate={[
                    minLength(
                      8,
                      t('your_password_must_have_8_characters_or_more')
                    ),
                    pattern(
                      /[A-Z]/,
                      t('your_password_must_have_1_uppercase_letter')
                    ),
                    pattern(
                      /[a-z]/,
                      t('your_password_must_have_1_lowercase_letter')
                    ),
                    pattern(/[0-9]/, t('your_password_must_have_1_digit')),
                    pattern(
                      /[\W]/,
                      t('your_password_must_have_1_special_character')
                    ),
                  ]}
                >
                  {(field, props) => (
                    <div class="register-field">
                      <label
                        class="register-field-label"
                        for="register-password"
                      >
                        {t('register_password_label')}
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
                          id="register-password"
                          data-cy="register-password"
                          type="password"
                          class={field.error ? 'register-input-error' : ''}
                          value={field.value || ''}
                          placeholder={t('register_password_placeholder')}
                          autocomplete="new-password"
                        />
                      </div>
                      <PasswordStrengthBar value={field.value} />
                      <Show when={field.error}>
                        <div class="register-field-error">{field.error}</div>
                      </Show>
                    </div>
                  )}
                </Field>

                <Field
                  name="checkPassword"
                  validate={[
                    mustMatch(newPassword)(t('passwords_do_not_match')),
                  ]}
                >
                  {(field, props) => (
                    <div class="register-field">
                      <label
                        class="register-field-label"
                        for="register-check-password"
                      >
                        {t('register_confirm_password_label')}
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
                          id="register-check-password"
                          data-cy="register-check-password"
                          type="password"
                          class={field.error ? 'register-input-error' : ''}
                          value={field.value || ''}
                          placeholder={t(
                            'register_confirm_password_placeholder'
                          )}
                          autocomplete="new-password"
                        />
                      </div>
                      <Show when={field.error}>
                        <div class="register-field-error">{field.error}</div>
                      </Show>
                    </div>
                  )}
                </Field>

                <Show when={state.response.status === 'error'}>
                  <Alert
                    data-cy="register-error"
                    type="error"
                    message={state.response.message}
                  />
                </Show>

                <Button
                  dataCy="register-button"
                  class="register-btn-submit"
                  type="submit"
                  isLoading={state.submitting}
                  label={
                    <Show when={!state.submitting}>
                      {isInvite()
                        ? t('invite_join_workspace')
                        : t('register_create_free_account')}
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

                <p class="register-terms">
                  {t('register_terms_prefix')}{' '}
                  <a href="#">{t('register_terms_of_service')}</a>{' '}
                  {t('register_terms_and')}{' '}
                  <a href="#">{t('register_privacy_policy')}</a>.
                </p>
              </div>
            </Form>

            <div class="register-signin-link">
              {t('already_have_an_account')}{' '}
              <A href={loginHref()}>{t('sign_in')}</A>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
