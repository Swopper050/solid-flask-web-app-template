import { JSXElement, Show } from 'solid-js'
import { A } from '@solidjs/router'
import { clsx } from 'clsx'

import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { LanguageSelector } from '../components/LanguageSelector'
import { TextInput } from '../components/TextInput'
import { useLocale } from '../context/LocaleProvider'

import {
  createForm,
  email,
  required,
  setResponse,
  SubmitHandler,
} from '@modular-forms/solid'

import { forgotPassword } from '../api'

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
        message: (await response.json()).error_message,
      })
      return
    }

    setResponse(forgotPasswordForm, { status: 'success' })
  }

  return (
    <>
      <div class="navbar fixed bg-base-100 top-0 left-0">
        <div class="flex-1" />
        <ThemeSwitcher />
        <LanguageSelector />
      </div>

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">
          {t('woops_i_forgot_my_password')}
        </h1>
      </div>

      <div class="flex justify-center mt-20">
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
            <div class="flex justify-center mt-4">
              <div role="alert" class="alert alert-success w-80">
                <span>
                  {t(
                    'if_a_user_with_this_email_exists_a_reset_password_mail_has_been_sent'
                  )}
                </span>
              </div>
            </div>
          </Show>

          <Show when={forgotPasswordForm.response.status === 'error'}>
            <div class="flex justify-center mt-4">
              <div role="alert" class="alert alert-error w-80">
                <i class="fa-solid fa-circle-exclamation" />{' '}
                <span>{forgotPasswordForm.response.message}</span>
              </div>
            </div>
          </Show>

          <div class="flex justify-center mt-10">
            <A class="btn btn-primary btn-outline" href="/home">
              {t('back_to_home')}
            </A>

            <button
              class={clsx(
                'btn btn-primary ml-4',
                (forgotPasswordForm.response.status === 'success' ||
                  forgotPasswordForm.submitting) &&
                  'btn-disabled'
              )}
              type="submit"
            >
              <Show
                when={forgotPasswordForm.submitting}
                fallback={t('send_reset_email')}
              >
                <span class="loading loading-ball" />
                {t('sending')}
              </Show>
            </button>
          </div>
        </ForgotPassword.Form>
      </div>
    </>
  )
}
