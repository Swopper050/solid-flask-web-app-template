import { JSXElement } from 'solid-js'
import { clsx } from 'clsx'
import { TranslationKey, TranslationKeys, useLocale } from '../context/LocaleProvider'

interface AlertProps {
  type: 'info' | 'error' | 'success' | 'warning'
  message?: TranslationKeys | string
  class?: string
}

export function Alert(props: AlertProps): JSXElement {
  const { t } = useLocale()
  const message = () =>
    t(props.message as TranslationKey) ?? props.message

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
