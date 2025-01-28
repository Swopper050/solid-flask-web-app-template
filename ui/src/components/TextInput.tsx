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
          'input input-bordered flex items-center mt-4',
          props.error !== '' && 'input-error'
        )}
      >
        {props.label} {props.required && <span>*</span>}
        {props.icon}
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
