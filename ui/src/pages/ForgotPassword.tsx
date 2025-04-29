import { JSXElement, Show } from 'solid-js'
import { A } from '@solidjs/router'

import { Alert } from '../components/Alert'
import { TopBar } from '../components/TopBar'
import { TextInput } from '../components/TextInput'
import { useLocale } from '../context/LocaleProvider'

import { email, required } from '@modular-forms/solid'

import { forgotPassword, ForgotPasswordData } from '../api'
import { Button } from '../components/Button'
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
    <>
      <TopBar />

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">
          {t('woops_i_forgot_my_password')}
        </h1>
      </div>

      <div class="flex justify-center mt-20">
        <div class="flex flex-col w-96">
          <Form onSubmit={onSubmit}>
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
                  disabled={state.response.status === 'success'}
                />
              )}
            </Field>

            <Show when={state.response.status === 'success'}>
              <div class="flex justify-center">
                <Alert
                  type="success"
                  message={
                    'if_a_user_with_this_email_exists_a_reset_password_mail_has_been_sent'
                  }
                  class="w-96"
                />
              </div>
            </Show>

            <Show when={state.response.status === 'error'}>
              <div class="flex justify-center">
                <Alert
                  type="error"
                  message={state.response.message}
                  class="w-96"
                />
              </div>
            </Show>

            <div class="flex justify-center mt-10 gap-2">
              <A class="btn btn-primary btn-outline" href="/home">
                {t('back_to_home')}
              </A>

              <Button
                label={t('send_reset_email')}
                color="primary"
                type="submit"
                isLoading={state.submitting}
                disabled={state.response.status === 'success'}
              />
            </div>
          </Form>
        </div>
      </div>
    </>
  )
}
