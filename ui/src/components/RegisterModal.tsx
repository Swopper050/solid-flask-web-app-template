import { JSXElement, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import { email, required } from '@modular-forms/solid'

import { register, RegisterUserData } from '../api'

import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { User, UserAttributes } from '../models/User'

import { TextInput } from './TextInput'
import { Modal, ModalBaseProps } from './Modal'
import { Alert } from './Alert'
import { Button } from './Button'
import { createFormState } from '../form_helpers'
import { mustMatch, passwordRules } from '../validators'

export function RegisterModal(props: ModalBaseProps): JSXElement {
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
    <Modal
      title={t('register')}
      isOpen={props.isOpen}
      onClose={() => {
        props.onClose()
      }}
    >
      <Form onSubmit={onSubmit} class="w-full">
        <div class="space-y-4">
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

          <Field name="password" validate={passwordRules(t)}>
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

          <div class="modal-action">
            <Button
              label={t('register')}
              type="submit"
              class="w-full"
              color="primary"
              isLoading={state.submitting}
            />
          </div>
        </div>
      </Form>
    </Modal>
  )
}
