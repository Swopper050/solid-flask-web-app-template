import { JSXElement } from 'solid-js'

interface AlertProps {
  type: 'info' | 'error' | 'success' | 'warning'
  message: string
}

export function Alert(props: AlertProps): JSXElement {
  return (
    <div class="toast toast-end">
      <Alert type={props.type} message={props.message} />
    </div>
  )
}
