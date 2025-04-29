import clsx from 'clsx'
import { JSXElement, Show } from 'solid-js'

type DaisyUIButtonColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

type DaisyUIButtonStyle =
  | 'outline'
  | 'dash'
  | 'soft'
  | 'ghost'
  | 'link'
  | 'outline'

type DaisyUIButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Renders a button component with an optional loading state.
 * If the loading state is passed the button will be disabled and show
 * a loader ball while loading.
 */
export function Button(props: {
  label: string
  icon?: string
  onClick?: (event?: MouseEvent) => void
  isLoading?: boolean
  disabled?: boolean
  type?: 'submit' | 'button' | 'reset'
  color?: DaisyUIButtonColor
  size?: DaisyUIButtonSize
  style?: DaisyUIButtonStyle
  class?: string
}): JSXElement {
  return (
    <button
      class={clsx(
        'btn',
        props.color ? `btn-${props.color}` : undefined,
        props.style ? `btn-${props.style}` : undefined,
        props.size ? `btn-${props.size}` : undefined,
        (props.isLoading || props.disabled) && 'btn-disabled',
        props.class
      )}
      type={props.type ?? 'button'}
      onClick={(event) => props.onClick?.(event)}
    >
      <Show when={props.icon}>
        <i class={props.icon} />
      </Show>

      {props.label}

      <Show when={props.isLoading}>
        <span
          class={clsx(
            'loading loading-ball',
            props.size ? `loading-${props.size}` : undefined
          )}
        />
      </Show>
    </button>
  )
}

export function IconButton(props: {
  icon: string
  onClick?: () => void
  isLoading?: boolean
  disabled?: boolean
  color?: DaisyUIButtonColor
  size?: DaisyUIButtonSize
  style?: DaisyUIButtonStyle
  class?: string
}): JSXElement {
  return (
    <button
      class={clsx(
        'btn',
        props.style ? `btn-${props.style}` : 'btn-ghost',
        props.size ? `btn-${props.size}` : 'btn-sm',
        props.isLoading && 'btn-disabled',
        props.class
      )}
      onClick={() => props.onClick?.()}
      disabled={props.disabled}
    >
      <Show
        when={props.isLoading}
        fallback={<i class={clsx(props.icon, `text-${props.color}`)} />}
      >
        <span class="loading loading-ball loading-xs" />
      </Show>
    </button>
  )
}
