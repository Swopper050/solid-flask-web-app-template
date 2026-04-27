import { User, UserAttributes } from '../../../models/User'
import { createEffect, JSXElement, Show } from 'solid-js'
import { useUser } from '../../../context/UserProvider'
import { useLocale } from '../../../context/LocaleProvider'

import { changePassword, ChangePasswordData } from '../../../api'
import { required } from '@modular-forms/solid'

import { Alert } from '../../../components/Alert'
import { TextInput } from '../../../components/TextInput'
import { Modal, ModalBaseProps } from '../../../components/Modal'
import { Button } from '../../../components/Button'
import { createFormState } from '../../../form_helpers'
import { mustMatch, passwordRules } from '../../../validators'

export function ChangePasswordModal(props: ModalBaseProps): JSXElement {
  const { t } = useLocale()
  const { setUser } = useUser()

  const {
    state,
    onSubmit,
    accessor,
    components: { Form, Field },
  } = createFormState<ChangePasswordData, UserAttributes>({
    action: changePassword,
    onFinish: () => {
      props.onClose()
    },
  })

  createEffect(() => {
    if (state.submitted === true) {
      if (state.response.status === 'success') {
        if (state.response.data !== undefined) {
          setUser(new User(state.response.data))
        }
      }
    }
  })

  const newPassword = () => accessor().newPassword

  return (
    <Modal
      title={t('change_password')}
      isOpen={props.isOpen}
      onClose={() => props.onClose()}
    >
      <Form onSubmit={onSubmit}>
        <Field name="currentPassword">
          {(field, props) => (
            <TextInput
              {...props}
              data-cy="change-password-current"
              type="password"
              value={field.value}
              error={field.error}
              placeholder={t('current_password')}
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Field>
        <Field
          name="newPassword"
          validate={[
            required(t('please_enter_a_new_password')),
            ...passwordRules(t),
          ]}
        >
          {(field, props) => (
            <TextInput
              {...props}
              data-cy="change-password-new"
              type="password"
              value={field.value}
              error={field.error}
              placeholder={t('new_password')}
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Field>
        <Field
          name="confirmNewPassword"
          validate={[mustMatch(newPassword)(t('passwords_do_not_match'))]}
        >
          {(field, props) => (
            <TextInput
              {...props}
              data-cy="change-password-confirm"
              type="password"
              value={field.value}
              error={field.error}
              placeholder={t('confirm_new_password')}
              icon={<i class="fa-solid fa-key" />}
            />
          )}
        </Field>

        <Show when={state.response.status === 'error'}>
          <Alert type="error" message={state.response.message} />
        </Show>

        <div class="modal-action">
          <Button
            label={t('change_password')}
            type="submit"
            color="primary"
            isLoading={state.submitting}
            dataCy="change-password-submit"
          />
        </div>
      </Form>
    </Modal>
  )
}
