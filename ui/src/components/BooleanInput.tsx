import { JSX, splitProps, JSXElement } from 'solid-js'

export function BooleanInput(props: {
  name: string
  type: 'checkbox'
  label?: string
  value: boolean
  error: string
  required?: boolean
  ref: (element: HTMLInputElement) => void
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>
  onChange: JSX.EventHandler<HTMLInputElement, Event>
}): JSXElement {
  const [, inputProps] = splitProps(props, ['value', 'label', 'error'])
  return (
    <div class="flex items-center mt-4 gap-2">
      <input {...inputProps} checked={props.value} class="checkbox" />
      <span>{props.label}</span>
    </div>
  )
}
