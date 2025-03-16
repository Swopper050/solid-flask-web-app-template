import { JSXElement, Show } from 'solid-js'
import { A, useSearchParams } from '@solidjs/router'

import { TopBar } from '../components/TopBar'
import { TextInput } from '../components/TextInput'
import { Alert } from '../components/Alert'

import { useLocale } from '../context/LocaleProvider'

import { getValue, required, minLength, pattern } from '@modular-forms/solid'

import { resetPassword, ResetPasswordData } from '../api'
import { getSingleParam } from './SearchParams'
import { Button } from '../components/Button'
import { createFormWithSubmit } from '../form_helpers'

export function ResetPasswordPage(): JSXElement {
  const { t } = useLocale()

  const [searchParams] = useSearchParams()

  const [resetPasswordForm, onSubmit, { Form, Field }] =
    createFormWithSubmit<ResetPasswordData>({
      action: resetPassword,
      formOptions: {
        initialValues: {
          email: getSingleParam(searchParams.email),
          resetToken: getSingleParam(searchParams.resetToken),
        },
      },
    })

  const newPassword = () => {
    return getValue(resetPasswordForm, 'newPassword', {
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
      <TopBar />

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">{t('reset_password')}</h1>
      </div>

      <div class="flex justify-center mt-20">
        <div class="flex flex-col w-80">
          <Form onSubmit={onSubmit}>
            <Field
              name="newPassword"
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
            </Field>

            <Field
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
            </Field>

            <Show when={resetPasswordForm.response.status === 'success'}>
              <div class="flex justify-center">
                <Alert
                  type="success"
                  message={t('successfully_reset_password')}
                  extraClasses="w-96"
                />
              </div>
            </Show>

            <Show when={resetPasswordForm.response.status === 'error'}>
              <div class="flex justify-center">
                <Alert
                  type="error"
                  message={resetPasswordForm.response.message}
                  extraClasses="w-96"
                />
              </div>
            </Show>

            <div class="flex justify-center mt-10 gap-2">
              <A class="btn btn-primary btn-outline" href="/home">
                {t('back_to_home')}
              </A>
              <Button
                label={t('reset_password')}
                isLoading={resetPasswordForm.submitting}
                type="submit"
                color="primary"
              />
            </div>
          </Form>
        </div>
      </div>
    </>
  )
}
