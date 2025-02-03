import {
  createSignal,
  JSXElement,
  Show,
  onMount,
  onCleanup,
  untrack,
} from 'solid-js'

import { Alert } from './Alert'

interface ToastProps {
  type: 'info' | 'error' | 'success' | 'warning'
  message: string
  duration?: number
  onClear?: () => void
}

export function Toast(props: ToastProps): JSXElement {
  const [visible, setVisible] = createSignal(true)
  let timerId: number

  onMount(() => {
    timerId = window.setTimeout(() => {
      untrack(() => {
        setVisible(false)
        props.onClear?.()
      })
    }, props.duration ?? 5000)
  })

  onCleanup(() => {
    clearTimeout(timerId)
  })

  return (
    <Show when={visible()}>
      <div class="toast toast-end">
        <Alert type={props.type ?? 'error'} message={props.message} />
      </div>
    </Show>
  )
}
