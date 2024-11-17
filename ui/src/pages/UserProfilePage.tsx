import {
  createSignal,
  JSX,
  JSXElement,
  Match,
  Show,
  splitProps,
  Switch,
} from 'solid-js'
import { useUser } from '../context'
import { clsx } from 'clsx'

import api, { changePassword, PostResponse } from '../api'
import { PasswordIcon } from '../components/icons/Password'
import {
  createForm,
  minLength,
  pattern,
  reset,
  SubmitHandler,
} from '@modular-forms/solid'

export function UserProfilePage(): JSXElement {
  const { user } = useUser()

  const [openPasswordModal, setOpenPasswordModal] = createSignal(false)

  return (
    <div class="mt-4 ml-10">
      <Show when={user().isAdmin}>
        <p class="text-lg text-success mr-4 mb-6 col-span-4">
          <i class="fa-solid fa-screwdriver-wrench mr-2" />
          This user is an admin
        </p>
      </Show>

      <div class="grid grid-cols-3 gap-4">
        <p class="text-lg font-bold mr-4 col-span-1">Email:</p>
        <p class="text-lg col-span-1">{user().email}</p>
        <p class="col-span-1">
          <Show when={user().isVerified} fallback={<VerifyEmailWarning />}>
            <p class="ml-4 tooltip" data-tip="Your email has been verified">
              <i class="fa-solid fa-check text-success" />
            </p>
          </Show>
        </p>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <p class="text-lg font-bold mr-4 col-span-1">Password:</p>
        <p class="text-lg col-span-1">*******</p>
        <p class="ml-4 tooltip" data-tip="Your email has been verified">
          <button
            class={clsx('btn btn-ghost btn-sm')}
            onClick={() => setOpenPasswordModal(true)}
          >
            <i class="fa-solid fa-edit" />
          </button>
        </p>
      </div>

      <ChangePasswordModal
        isOpen={openPasswordModal()}
        onClose={() => setOpenPasswordModal(false)}
      />
    </div>
  )
}

type ChangePasswordFormData = {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
}

function ChangePasswordForm(): JSXElement {
  const [changePasswordForm, { Form, Field }] =
    createForm<ChangePasswordFormData>()
  const [response, setResponse] = createSignal<PostResponse | undefined>(
    undefined
  )
  const { setUser } = useUser()

  const onSubmit: SubmitHandler<ChangePasswordFormData> = async (values) => {
    changePassword(values.oldPassword, values.newPassword, setResponse, setUser)

    reset(changePasswordForm)
  }

  return (
    <Form onSubmit={onSubmit}>
      <Switch>
        <Match when={response() !== undefined && response().loading}>
          <div>loading</div>
        </Match>

        <Match when={response() !== undefined && response().success}>
          <div>succes</div>
        </Match>

        <Match when={response() !== undefined && !response().success}>
          <div>failed</div>
        </Match>
      </Switch>

      <Field name="oldPassword">
        {(field, props) => (
          <TextInput
            {...props}
            type="password"
            value={field.value}
            error={field.error}
            placeholder="Current password"
          />
        )}
      </Field>
      <Field
        name="newPassword"
        validate={[
          minLength(8, 'You password must have 8 characters or more.'),
          pattern(/[A-Z]/, 'Must contain 1 uppercase letter '),
          pattern(/[a-z]/, 'Must contain 1 lower case capitol'),
          pattern(/[0-9]/, 'Must contain 1 digit'),
        ]}
      >
        {(field, props) => (
          <TextInput
            {...props}
            type="password"
            value={field.value}
            error={field.error}
            placeholder="New password"
          />
        )}
      </Field>
      <Field
        name="confirmNewPassword"
        // TODO fix validation
      >
        {(field, props) => (
          <TextInput
            {...props}
            type="password"
            value={field.value}
            error={field.error}
            placeholder="Confirm new password"
          />
        )}
      </Field>
      <button class="mt-4 btn btn-primary " type="submit">
        Change
      </button>
    </Form>
  )
}

function ChangePasswordModal(props: {
  isOpen: boolean
  onClose: () => void
}): JSXElement {
  return (
    <Modal
      title="Change password"
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <ChangePasswordForm />
    </Modal>
  )
}

type TextInputProps = {
  name: string
  type: 'text' | 'email' | 'tel' | 'password' | 'url' | 'date'
  label?: string
  placeholder?: string
  value: string | undefined
  error: string
  required?: boolean
  ref: (element: HTMLInputElement) => void
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>
  onChange: JSX.EventHandler<HTMLInputElement, Event>
  onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>
}

export function TextInput(props: TextInputProps) {
  const [, inputProps] = splitProps(props, ['value', 'label', 'error'])
  return (
    <div>
      <label
        for={props.name}
        class={clsx(
          'input input-bordered flex items-center mt-2',
          props.error !== '' && 'input-error'
        )}
      >
        {props.label} {props.required && <span>*</span>}
        <PasswordIcon />
        <input
          class="grow ml-2"
          {...inputProps}
          id={props.name}
          value={props.value || ''}
          aria-invalid={!!props.error}
          aria-errormessage={`${props.name}-error`}
        />
      </label>
      {props.error && <div id={`${props.name}-error`}>{props.error}</div>}
    </div>
  )
}

function Modal(props: {
  title: string
  isOpen: boolean
  children: JSXElement | JSXElement[]
  onClose: () => void
}): JSXElement {
  const isOpen = () => props.isOpen

  return (
    <>
      <dialog class={clsx('modal', isOpen() ? 'modal-open' : 'modal-close')}>
        <div class="modal-box">
          <button
            class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            onClick={() => props.onClose()}
          >
            ✕
          </button>
          <h3 class="font-bold text-lg">{props.title}</h3>
          {props.children}
        </div>
      </dialog>
    </>
  )
}

function VerifyEmailWarning(): JSXElement {
  const [sending, setSending] = createSignal(false)

  const resendVerificationMail = () => {
    setSending(true)
    api.post('/resend_email_verification').finally(() => setSending(false))
  }

  return (
    <>
      <span class="ml-4 tooltip" data-tip="Your email is not verified yet">
        <i class="fa-solid fa-triangle-exclamation text-warning" />
      </span>
      <span class="ml-4 tooltip" data-tip="Resend verification mail">
        <button
          class={clsx('btn btn-ghost btn-sm', sending() && 'btn-disabled')}
          onClick={resendVerificationMail}
        >
          <Show when={sending()}>
            <span class="loading loading-ball loading-sm" />
          </Show>
          <i class="fa-solid fa-arrow-rotate-left" />
        </button>
      </span>
    </>
  )
}
