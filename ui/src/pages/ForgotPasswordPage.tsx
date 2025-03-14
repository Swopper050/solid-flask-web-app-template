import { JSXElement, Show } from 'solid-js'
import { A } from '@solidjs/router'

import { Alert } from '../components/Alert'
import { TopBar } from '../components/TopBar'
import { TextInput } from '../components/TextInput'
import { useLocale } from '../context/LocaleProvider'

import {
  createForm,
  email,
  required,
  setResponse,
  SubmitHandler,
} from '@modular-forms/solid'

import { forgotPassword, getErrorMessage } from '../api'
import { Button } from '../components/Button'

type ForgotPasswordFormData = {
  email: string
}

export function ForgotPasswordPage(): JSXElement {
  const { t } = useLocale()

  const [forgotPasswordForm, ForgotPassword] =
    createForm<ForgotPasswordFormData>()

  const onPasswordReset: SubmitHandler<ForgotPasswordFormData> = async (
    values
  ) => {
    const response = await forgotPassword(values.email)

    if (response.status !== 200) {
      setResponse(forgotPasswordForm, {
        status: 'error',
        message: t(await getErrorMessage(response)),
      })
      return
    }

    setResponse(forgotPasswordForm, { status: 'success' })
  }

  return (
    <>
      <TopBar />

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">
          {t('woops_i_forgot_my_password')}
        </h1>
      </div>

      <div class="flex justify-center mt-20">
        <div class="flex flex-col">
          <ForgotPassword.Form onSubmit={onPasswordReset}>
            <ForgotPassword.Field
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
            </ForgotPassword.Field>

            <Show when={forgotPasswordForm.response.status === 'success'}>
              <div class="flex justify-center">
                <Alert
                  type="success"
                  message={t(
                    'if_a_user_with_this_email_exists_a_reset_password_mail_has_been_sent'
                  )}
                />
              </div>
            </Show>

            <Show when={forgotPasswordForm.response.status === 'error'}>
              <div class="flex justify-center">
                <Alert
                  type="error"
                  message={forgotPasswordForm.response.message}
                  extraClasses="w-96"
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
                isLoading={forgotPasswordForm.submitting}
              />
            </div>
          </ForgotPassword.Form>
        </div>
      </div>
    </>
  )
}
