import clsx from 'clsx'
import { JSX, JSXElement, Show } from 'solid-js'

type DaisyUIButtonColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

type DaisyUIButtonVariant = 'outline' | 'dash' | 'soft' | 'ghost' | 'link'

type DaisyUIButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

type DaisyUIButtonShape = 'square' | 'circle'

interface ButtonBaseProps {
  onClick?: (event?: MouseEvent) => void
  isLoading?: boolean
  disabled?: boolean
  type?: 'submit' | 'button' | 'reset'
  color?: DaisyUIButtonColor
  size?: DaisyUIButtonSize
  variant?: DaisyUIButtonVariant
  shape?: DaisyUIButtonShape
  block?: boolean
  class?: string
  style?: JSX.CSSProperties
  dataCy?: string
  ref?: (el: HTMLButtonElement) => void
}

/**
 * Renders a button component with an optional loading state.
 * If the loading state is passed the button will be disabled and show
 * a loader ball while loading.
 */
export function Button(
  props: ButtonBaseProps & {
    label: JSXElement
    icon?: string
    trailingIcon?: string
  }
): JSXElement {
  const isDisabled = () => props.disabled || props.isLoading

  return (
    <button
      ref={props.ref}
      class={clsx(
        'btn',
        props.color && `btn-${props.color}`,
        props.variant && `btn-${props.variant}`,
        props.size && `btn-${props.size}`,
        props.shape && `btn-${props.shape}`,
        props.block && 'btn-block',
        props.class
      )}
      type={props.type ?? 'button'}
      disabled={isDisabled()}
      style={props.style}
      onClick={(event) => props.onClick?.(event)}
      data-cy={props.dataCy}
    >
      <Show
        when={props.isLoading}
        fallback={
          <Show when={props.icon}>
            <i class={props.icon} />
          </Show>
        }
      >
        <span
          class={clsx(
            'loading loading-ball',
            props.size && `loading-${props.size}`
          )}
        />
      </Show>

      {props.label}

      <Show when={props.trailingIcon && !props.isLoading}>
        <i class={props.trailingIcon} />
      </Show>
    </button>
  )
}

export function IconButton(
  props: ButtonBaseProps & {
    icon: string
  }
): JSXElement {
  const isDisabled = () => props.disabled || props.isLoading

  return (
    <button
      ref={props.ref}
      class={clsx(
        'btn',
        props.variant ? `btn-${props.variant}` : 'btn-ghost',
        props.size ? `btn-${props.size}` : 'btn-sm',
        props.shape && `btn-${props.shape}`,
        props.class
      )}
      type={props.type ?? 'button'}
      disabled={isDisabled()}
      style={props.style}
      onClick={(event) => props.onClick?.(event)}
      data-cy={props.dataCy}
    >
      <Show
        when={props.isLoading}
        fallback={
          <i class={clsx(props.icon, props.color && `text-${props.color}`)} />
        }
      >
        <span class="loading loading-ball loading-xs" />
      </Show>
    </button>
  )
}
