import clsx from 'clsx'
import { JSXElement, Show } from 'solid-js'

/**
 * Renders a button component with an optional loading state.
 * If the loading state is passed the button will be disabled and show
 * a loader ball while loading.
 */
export function Button(props: {
  label: string
  icon?: string
  onClick?: (event?: InputEvent) => void
  isLoading?: boolean
  type?: 'submit' | 'button' | 'reset'
  variant?: 'primary' | 'secondary' | 'error' | 'success'
  class?: string
}): JSXElement {
  return (
    <button
      class={clsx(
        'btn',
        props.variant ? `btn-${props.variant}` : 'btn-primary',
        props.isLoading && 'btn-disabled',
        props.class
      )}
      type={props.type ?? 'button'}
      onClick={() => props.onClick()}
    >
      <Show when={props.icon}>
        <i class={props.icon} />
      </Show>

      {props.label}

      <Show when={props.isLoading}>
        <span class="loading loading-ball" />
      </Show>
    </button>
  )
}

export function IconButton(props: {
  icon: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'error' | 'success'
  class?: string
  isLoading?: boolean
}): JSXElement {
  return (
    <button
      class={clsx(
        'btn btn-ghost btn-sm',
        props.variant ? `btn-${props.variant}` : 'btn-primary',
        props.class
      )}
      onClick={() => props.onClick()}
    >
      <Show
        when={props.isLoading}
        fallback={<i class={clsx(props.icon, 'text-primary')} />}
      >
        <span class="loading loading-ball" />
      </Show>
    </button>
  )
}
