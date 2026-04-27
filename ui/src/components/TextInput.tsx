import clsx from 'clsx'
import { JSX, splitProps, JSXElement } from 'solid-js'

type TextInputProps = {
  name: string
  type: 'text' | 'email' | 'tel' | 'password' | 'url' | 'date'
  label?: string
  placeholder?: string
  value: string | undefined
  error: string
  icon?: JSXElement
  required?: boolean
  disabled?: boolean
  autocomplete?: string
  'data-cy'?: string
  ref: (element: HTMLInputElement) => void
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>
  onChange: JSX.EventHandler<HTMLInputElement, Event>
  onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>
}

export function TextInput(props: TextInputProps) {
  const [, inputProps] = splitProps(props, ['value', 'label', 'error'])
  return (
    <div>
      {props.label && (
        <label for={props.name} class="label label-text mb-1">
          {props.label}
          {props.required && <span class="text-error ml-0.5">*</span>}
        </label>
      )}
      <label
        class={clsx(
          'input input-bordered flex items-center w-full',
          props.error !== '' && 'input-error'
        )}
      >
        {props.icon}
        <input
          class="grow ml-2"
          {...inputProps}
          id={props.name}
          value={props.value || ''}
          aria-invalid={!!props.error}
          aria-errormessage={`${props.name}-error`}
          disabled={props.disabled || false}
        />
      </label>
      {props.error && <div id={`${props.name}-error`}>{props.error}</div>}
    </div>
  )
}
