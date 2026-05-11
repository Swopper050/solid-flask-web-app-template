import clsx from 'clsx'
import { JSXElement } from 'solid-js'

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type SpinnerStyle = 'ball' | 'spinner'

interface SpinnerProps {
  size?: SpinnerSize
  variant?: SpinnerStyle
  color?: 'primary' | 'success' | 'error' | 'warning' | 'info'
  class?: string
}

export function Spinner(props: SpinnerProps): JSXElement {
  return (
    <span
      class={clsx(
        'loading',
        `loading-${props.variant ?? 'ball'}`,
        `loading-${props.size ?? 'md'}`,
        props.color && `text-${props.color}`,
        props.class
      )}
    />
  )
}

export function FullScreenSpinner(props: SpinnerProps): JSXElement {
  return (
    <div class="flex items-center justify-center min-h-screen">
      <Spinner
        size={props.size ?? 'lg'}
        color={props.color ?? 'primary'}
        variant={props.variant}
        class={props.class}
      />
    </div>
  )
}

export function CenteredSpinner(props: SpinnerProps): JSXElement {
  return (
    <div class={clsx('flex justify-center', props.class)}>
      <Spinner size={props.size} color={props.color} variant={props.variant} />
    </div>
  )
}
