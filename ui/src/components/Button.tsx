import clsx from 'clsx'
import { JSXElement, Show } from 'solid-js'

/**
 * Renders a button component with an optional loading state.
 * If the loading state is passed the button will be disabled and show
 * a loader ball while loading.
 *
 */
export function Button(props: {
  children: JSXElement[] | JSXElement
  onClick?: () => void
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
      onClick={() => props.onClick?.()}
    >
      {props.children}
      <Show when={props.isLoading}>
        <span class="loading loading-ball" />
      </Show>
    </button>
  )
}
