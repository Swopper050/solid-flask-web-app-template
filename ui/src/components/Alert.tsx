import { JSXElement } from 'solid-js'
import { clsx } from 'clsx'

interface AlertProps {
  type: 'info' | 'error' | 'success' | 'warning'
  message: string
  extraClasses?: string
}

export function Alert(props: AlertProps): JSXElement {
  const types = {
    info: { alert: 'alert-info', icon: 'fa-circle-info' },
    error: { alert: 'alert-error', icon: 'fa-circle-xmark' },
    success: { alert: 'alert-success', icon: 'fa-circle-check' },
    warning: { alert: 'alert-warning', icon: 'fa-circle-exclamation' },
  }

  return (
    <div
      role="alert"
      class={clsx('alert my-4', types[props.type].alert, props?.extraClasses)}
    >
      <i class={clsx('fa-solid mr-2', types[props.type].icon)} />
      <span>{props.message}</span>
    </div>
  )
}
