import { JSXElement, Show, JSX } from 'solid-js'

type InputAttrs = JSX.InputHTMLAttributes<HTMLInputElement> & {
  'data-cy'?: string
}

interface AuthFormFieldProps {
  label?: string
  icon: JSXElement
  error?: string
  inputProps: InputAttrs
}

/**
 * Auth-page input field that pairs an icon, an input, and an inline error.
 * Used by the Login and Register pages, which share the `register-*` styles.
 */
export function AuthFormField(props: AuthFormFieldProps): JSXElement {
  return (
    <div class="register-field">
      <Show when={props.label}>
        <label class="register-field-label">{props.label}</label>
      </Show>
      <div class="register-input-wrap">
        <span class="register-input-icon">{props.icon}</span>
        <input
          {...props.inputProps}
          class={props.error ? 'register-input-error' : props.inputProps.class}
        />
      </div>
      <Show when={props.error}>
        <div class="register-field-error">{props.error}</div>
      </Show>
    </div>
  )
}
