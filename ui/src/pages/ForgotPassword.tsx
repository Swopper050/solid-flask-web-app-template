import { JSXElement, Show } from 'solid-js'
import { A } from '@solidjs/router'
import { email, required } from '@modular-forms/solid'

import { Alert } from '../components/Alert'
import { AuthCard } from '../components/AuthCard'
import { TextInput } from '../components/TextInput'
import { Button } from '../components/Button'
import { useLocale } from '../context/LocaleProvider'
import { forgotPassword, ForgotPasswordData } from '../api'
import { createFormState } from '../form_helpers'

export function ForgotPasswordPage(): JSXElement {
  const { t } = useLocale()

  const {
    state,
    onSubmit,
    components: { Form, Field },
  } = createFormState<ForgotPasswordData>({
    action: forgotPassword,
    resetOnFinish: false,
  })

  return (
    <AuthCard
      title={t('forgot_password')}
      subtitle={t('forgot_password_subtitle')}
    >
      <Form onSubmit={onSubmit}>
        <div class="space-y-1">
          <Field
            name="email"
            validate={[
              required(t('please_enter_your_email')),
              email(t('please_enter_a_valid_email')),
            ]}
          >
            {(field, props) => (
              <TextInput
                {...props}
                data-cy="forgot-password-email"
                type="email"
                value={field.value}
                error={field.error}
                placeholder={t('email_placeholder')}
                icon={<i class="fa-solid fa-envelope" />}
                disabled={state.response.status === 'success'}
                autocomplete="email"
              />
            )}
          </Field>

          <Show when={state.response.status === 'success'}>
            <Alert
              data-cy="forgot-password-success"
              type="success"
              message={
                'if_a_user_with_this_email_exists_a_reset_password_mail_has_been_sent'
              }
            />
          </Show>

          <Show when={state.response.status === 'error'}>
            <Alert type="error" message={state.response.message} />
          </Show>

          <Button
            label={t('send_reset_email')}
            color="primary"
            type="submit"
            class="w-full mt-2"
            isLoading={state.submitting}
            disabled={state.response.status === 'success'}
            dataCy="forgot-password-submit"
          />
        </div>
      </Form>

      <div class="divider my-4 text-base-content/30 text-xs">{t('or')}</div>

      <p class="text-xs text-base-content/50 text-center">
        <A class="text-primary font-medium" href="/login">
          ← {t('back_to_login')}
        </A>
      </p>
    </AuthCard>
  )
}
