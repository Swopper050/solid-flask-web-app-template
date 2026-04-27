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
import { email, required } from '@modular-forms/solid'

import { register, RegisterUserData, lookupInvitation } from '../api'
import { User, UserAttributes } from '../models/User'
import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { useWorkspace } from '../context/WorkspaceProvider'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { AuthFormField } from '../components/AuthFormField'
import { MarketingAuthLayout } from '../components/MarketingAuthLayout'
import { FullScreenSpinner } from '../components/Spinner'
import {
  AppLogo,
  ArrowRightIcon,
  EnvelopeIcon,
  LockIcon,
  UserIcon,
} from '../components/auth-icons'
import { createFormState } from '../form_helpers'
import { mustMatch, passwordRules } from '../validators'

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
        <FullScreenSpinner />
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

function InviteBadge(props: { workspaceName: string }): JSXElement {
  const { t } = useLocale()
  return (
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
          {props.workspaceName}
        </span>
      </div>
    </div>
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

  const inviteLogo = <AppLogo />

  const defaultLogo = (
    <>
      <div class="register-logo-mark">
        <AppLogo />
      </div>
      <span class="register-logo-text">{t('my_solid_app')}</span>
    </>
  )

  return (
    <MarketingAuthLayout
      logo={isInvite() ? inviteLogo : defaultLogo}
      topbarRight={
        <Show
          when={isInvite()}
          fallback={
            <A href={loginHref()} class="register-topbar-link">
              {t('already_have_an_account')} <strong>{t('sign_in')} →</strong>
            </A>
          }
        >
          <InviteBadge workspaceName={inviteInfo()!.workspace_name} />
        </Show>
      }
      headline={
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
      }
      subtitle={
        <Show when={isInvite()} fallback={t('register_subtitle')}>
          {t('invite_subtitle')}
        </Show>
      }
      formPanel={
        <>
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
                  <AuthFormField
                    label={t('name')}
                    icon={<UserIcon />}
                    error={field.error}
                    inputProps={{
                      ...props,
                      id: 'register-name',
                      'data-cy': 'register-name',
                      type: 'text',
                      value: field.value || '',
                      placeholder: t('name_placeholder'),
                      autocomplete: 'given-name',
                    }}
                  />
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
                  <AuthFormField
                    label={t('register_email_label')}
                    icon={<EnvelopeIcon />}
                    error={field.error}
                    inputProps={{
                      ...props,
                      id: 'register-email',
                      'data-cy': 'register-email',
                      type: 'email',
                      value: isInvite()
                        ? inviteInfo()!.email
                        : field.value || '',
                      readonly: isInvite(),
                      placeholder: t('email_placeholder'),
                      autocomplete: 'email',
                    }}
                  />
                )}
              </Field>

              <Field name="password" validate={passwordRules(t)}>
                {(field, props) => (
                  <>
                    <AuthFormField
                      label={t('register_password_label')}
                      icon={<LockIcon />}
                      error={field.error}
                      inputProps={{
                        ...props,
                        id: 'register-password',
                        'data-cy': 'register-password',
                        type: 'password',
                        value: field.value || '',
                        placeholder: t('register_password_placeholder'),
                        autocomplete: 'new-password',
                      }}
                    />
                    <PasswordStrengthBar value={field.value} />
                  </>
                )}
              </Field>

              <Field
                name="checkPassword"
                validate={[mustMatch(newPassword)(t('passwords_do_not_match'))]}
              >
                {(field, props) => (
                  <AuthFormField
                    label={t('register_confirm_password_label')}
                    icon={<LockIcon />}
                    error={field.error}
                    inputProps={{
                      ...props,
                      id: 'register-check-password',
                      'data-cy': 'register-check-password',
                      type: 'password',
                      value: field.value || '',
                      placeholder: t('register_confirm_password_placeholder'),
                      autocomplete: 'new-password',
                    }}
                  />
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
                    <ArrowRightIcon />
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
        </>
      }
    />
  )
}
