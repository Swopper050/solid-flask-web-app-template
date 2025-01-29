import { JSXElement, Show } from 'solid-js'
import { A, useSearchParams } from '@solidjs/router'
import { clsx } from 'clsx'

import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { LanguageSelector } from '../components/LanguageSelector'
import { TextInput } from '../components/TextInput'

import { useLocale } from '../context/LocaleProvider'

import {
  getValue,
  createForm,
  required,
  minLength,
  pattern,
  setResponse,
  SubmitHandler,
} from '@modular-forms/solid'

import { resetPassword } from '../api'

type PasswordResetFormData = {
  password: string
  checkPassword: string
}

export function ResetPasswordPage(): JSXElement {
  const { t } = useLocale()

  const [searchParams] = useSearchParams()
  const [resetPasswordForm, ResetPassword] = createForm<PasswordResetFormData>()

  const onResetPassword: SubmitHandler<PasswordResetFormData> = async (
    values
  ) => {
    const response = await resetPassword(
      searchParams.email,
      searchParams.reset_token,
      values.password
    )

    if (response.status !== 200) {
      setResponse(resetPasswordForm, {
        status: 'error',
        message: (await response.json()).error_message,
      })
      return
    }

    setResponse(resetPasswordForm, { status: 'success' })
  }

  const newPassword = () => {
    return getValue(resetPasswordForm, 'password', {
      shouldActive: false,
      shouldTouched: true,
      shouldDirty: true,
      shouldValid: true,
    })
  }

  const mustMatch = (
    error: string
  ): ((value: string | undefined) => string) => {
    return (value: string | undefined) => {
      return value !== newPassword() ? error : ''
    }
  }

  return (
    <>
      <div class="navbar fixed bg-base-100 top-0 left-0">
        <div class="flex-1" />
        <ThemeSwitcher />
        <LanguageSelector />
      </div>

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">{t('reset_password')}</h1>
      </div>

      <div class="flex justify-center mt-20">
        <div class="flex flex-col w-80">
          <ResetPassword.Form onSubmit={onResetPassword}>
            <ResetPassword.Field
              name="password"
              validate={[
                required(t('please_enter_a_new_password')),
                minLength(8, t('your_password_must_have_8_characters_or_more')),
                pattern(
                  /[A-Z]/,
                  t('your_password_must_have_1_uppercase_letter')
                ),
                pattern(
                  /[a-z]/,
                  t('your_password_must_have_1_lowercase_letter')
                ),
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
                />
              )}
            </ResetPassword.Field>

            <ResetPassword.Field
              name="checkPassword"
              validate={[
                required(t('please_confirm_your_new_password')),
                mustMatch(t('passwords_do_not_match')),
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
                />
              )}
            </ResetPassword.Field>

            <Show when={resetPasswordForm.response.status === 'success'}>
              <div class="flex justify-center my-4">
                <div role="alert" class="alert alert-success w-80">
                  <span>{t('successfully_reset_password')}</span>
                </div>
              </div>
            </Show>

            <Show when={resetPasswordForm.response.status === 'error'}>
              <div class="flex justify-center my-4">
                <div role="alert" class="alert alert-error w-80">
                  <i class="fa-solid fa-circle-exclamation" />{' '}
                  <span>{resetPasswordForm.response.message}</span>
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
                  (resetPasswordForm.response.status === 'success' ||
                    resetPasswordForm.submitting) &&
                    'btn-disabled'
                )}
                type="submit"
              >
                <Show
                  when={resetPasswordForm.submitting}
                  fallback={t('reset_password')}
                >
                  <span class="loading loading-spinner" />
                  {t('resetting')}
                </Show>
              </button>
            </div>
          </ResetPassword.Form>
        </div>
      </div>
    </>
  )
}
