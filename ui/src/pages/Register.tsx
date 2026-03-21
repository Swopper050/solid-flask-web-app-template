import { JSXElement, Show } from 'solid-js'
import { useNavigate, A } from '@solidjs/router'
import { minLength, pattern, email, required } from '@modular-forms/solid'

import { register, RegisterUserData } from '../api'
import { User, UserAttributes } from '../models/User'
import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { TextInput } from '../components/TextInput'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { AuthCard } from '../components/AuthCard'
import { createFormState } from '../form_helpers'
import { mustMatch } from '../validators'

export function RegisterPage(): JSXElement {
  const { t } = useLocale()
  const { setUser } = useUser()
  const navigate = useNavigate()

  const {
    state,
    onSubmit,
    accessor,
    components: { Form, Field },
  } = createFormState<RegisterUserData, UserAttributes>({
    action: register,
    onFinish: (response) => {
      if (response !== undefined) {
        setUser(new User(response))
      }
      navigate('/home')
    },
  })

  const newPassword = () => accessor().password

  return (
    <AuthCard title={t('create_your_account')} subtitle={t('get_started')}>
      <Form onSubmit={onSubmit}>
        <div class="space-y-1">
          <Field name="name" validate={[required(t('please_enter_your_name'))]}>
            {(field, props) => (
              <TextInput
                {...props}
                type="text"
                value={field.value}
                error={field.error}
                placeholder={t('name_placeholder')}
                icon={<i class="fa-solid fa-user" />}
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
              <TextInput
                {...props}
                type="email"
                value={field.value}
                error={field.error}
                placeholder={t('email_placeholder')}
                icon={<i class="fa-solid fa-envelope" />}
              />
            )}
          </Field>

          <Field
            name="password"
            validate={[
              minLength(8, t('your_password_must_have_8_characters_or_more')),
              pattern(/[A-Z]/, t('your_password_must_have_1_uppercase_letter')),
              pattern(/[a-z]/, t('your_password_must_have_1_lowercase_letter')),
              pattern(/[0-9]/, t('your_password_must_have_1_digit')),
              pattern(/[\W]/, t('your_password_must_have_1_special_character')),
            ]}
          >
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
          </Field>

          <Field
            name="checkPassword"
            validate={[mustMatch(newPassword)(t('passwords_do_not_match'))]}
          >
            {(field, props) => (
              <TextInput
                {...props}
                type="password"
                value={field.value}
                error={field.error}
                placeholder={t('confirm_password')}
                icon={<i class="fa-solid fa-key" />}
              />
            )}
          </Field>

          <Show when={state.response.status === 'error'}>
            <Alert type="error" message={state.response.message} />
          </Show>

          <Button
            label={t('register')}
            type="submit"
            class="w-full mt-2"
            color="primary"
            isLoading={state.submitting}
          />
        </div>
      </Form>

      <div class="divider my-4 text-base-content/30 text-xs">{t('or')}</div>

      <p class="text-xs text-base-content/50 text-center">
        {t('already_have_an_account')}{' '}
        <A class="text-primary font-medium" href="/login">
          {t('sign_in')}
        </A>
      </p>
    </AuthCard>
  )
}
