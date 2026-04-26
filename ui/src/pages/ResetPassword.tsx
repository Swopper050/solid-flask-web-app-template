import { JSXElement, Show } from 'solid-js'
import { A, useSearchParams } from '@solidjs/router'
import { required, minLength, pattern } from '@modular-forms/solid'

import { AuthCard } from '../components/AuthCard'
import { TextInput } from '../components/TextInput'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { useLocale } from '../context/LocaleProvider'
import { resetPassword, ResetPasswordData } from '../api'
import { getSingleParam } from './SearchParams'
import { createFormState } from '../form_helpers'
import { mustMatch } from '../validators'

export function ResetPasswordPage(): JSXElement {
  const { t } = useLocale()
  const [searchParams] = useSearchParams()

  const {
    state,
    onSubmit,
    accessor,
    components: { Form, Field },
  } = createFormState<ResetPasswordData>({
    action: resetPassword,
    formOptions: {
      initialValues: {
        email: getSingleParam(searchParams.email),
        resetToken: getSingleParam(searchParams.reset_token),
      },
    },
    resetOnFinish: false,
  })

  const newPassword = () => accessor().newPassword

  return (
    <AuthCard
      title={t('reset_password')}
      subtitle={t('reset_password_subtitle')}
    >
      <Form onSubmit={onSubmit}>
        <div class="space-y-1">
          <Field name="email">
            {(field, props) => (
              <TextInput
                {...props}
                type="email"
                value={field.value}
                error={field.error}
                icon={<i class="fa-solid fa-envelope" />}
                disabled={true}
              />
            )}
          </Field>

          <Field name="resetToken">
            {(field, props) => (
              <TextInput
                {...props}
                type="password"
                value={field.value}
                error={field.error}
                icon={<i class="fa-solid fa-key" />}
                disabled={true}
              />
            )}
          </Field>

          <Field
            name="newPassword"
            validate={[
              required(t('please_enter_a_new_password')),
              minLength(8, t('your_password_must_have_8_characters_or_more')),
              pattern(/[A-Z]/, t('your_password_must_have_1_uppercase_letter')),
              pattern(/[a-z]/, t('your_password_must_have_1_lowercase_letter')),
              pattern(/[0-9]/, t('your_password_must_have_1_digit')),
            ]}
          >
            {(field, props) => (
              <TextInput
                {...props}
                type="password"
                value={field.value}
                error={field.error}
                placeholder={t('new_password')}
                icon={<i class="fa-solid fa-key" />}
                disabled={state.response.status === 'success'}
                autocomplete="new-password"
              />
            )}
          </Field>

          <Field
            name="checkPassword"
            validate={[
              required(t('please_confirm_your_new_password')),
              mustMatch(newPassword)(t('passwords_do_not_match')),
            ]}
          >
            {(field, props) => (
              <TextInput
                {...props}
                type="password"
                value={field.value}
                error={field.error}
                placeholder={t('confirm_new_password')}
                icon={<i class="fa-solid fa-key" />}
                disabled={state.response.status === 'success'}
                autocomplete="new-password"
              />
            )}
          </Field>

          <Show when={state.response.status === 'success'}>
            <Alert type="success" message={t('successfully_reset_password')} />
          </Show>

          <Show when={state.response.status === 'error'}>
            <Alert type="error" message={state.response.message} />
          </Show>

          <Button
            label={t('reset_password')}
            isLoading={state.submitting}
            type="submit"
            color="primary"
            class="w-full mt-2"
            disabled={state.response.status === 'success'}
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
