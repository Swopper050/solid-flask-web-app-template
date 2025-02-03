import { createSignal, JSXElement, Show, onMount, onCleanup } from 'solid-js'

import { Alert } from './Alert'

interface ToastProps {
  type: 'info' | 'error' | 'success' | 'warning'
  message: string
  duration?: number
}

export function Toast(props: ToastProps): JSXElement {
  const [visible, setVisible] = createSignal(true)
  let timerId: number

  onMount(() => {
    timerId = window.setTimeout(() => setVisible(false), props.duration ?? 5000)
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
