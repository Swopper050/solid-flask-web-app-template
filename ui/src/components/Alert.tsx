import { JSXElement } from 'solid-js'
import { clsx } from 'clsx'
import { TranslationKey, useLocale } from '../context/LocaleProvider'

interface AlertProps {
  type: 'info' | 'error' | 'success' | 'warning'
  message?: TranslationKey | string
  class?: string
}

export function Alert(props: AlertProps): JSXElement {
  const { t } = useLocale()

  const translated = () => t((props.message as TranslationKey) ?? '')
  const message = () => (translated() ? translated() : props.message)

  const types = {
    info: { alert: 'alert-info', icon: 'fa-circle-info' },
    error: { alert: 'alert-error', icon: 'fa-circle-xmark' },
    success: { alert: 'alert-success', icon: 'fa-circle-check' },
    warning: { alert: 'alert-warning', icon: 'fa-circle-exclamation' },
  }

  return (
    <div
      role="alert"
      class={clsx('alert my-4', types[props.type].alert, props?.class)}
    >
      <i class={clsx('fa-solid mr-2', types[props.type].icon)} />
      <span>{message()}</span>
    </div>
  )
}
