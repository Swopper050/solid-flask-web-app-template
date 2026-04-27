import clsx from 'clsx'
import { JSXElement } from 'solid-js'

type AvatarSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'w-5 h-5 text-xs',
  md: 'w-6 h-6 text-xs',
  lg: 'w-10 h-10 md:w-12 md:h-12 text-base md:text-xl',
}

interface WorkspaceAvatarProps {
  name: string | undefined
  color?: string | null
  size?: AvatarSize
  /** Use a softer fallback (used by WorkspaceSwitcher's "other workspaces" rows). */
  mutedFallback?: boolean
  shape?: 'rounded' | 'square'
  class?: string
}

/**
 * Coloured square showing the first letter of a workspace name.
 * Used by the workspace switcher and workspace settings modal.
 */
export function WorkspaceAvatar(props: WorkspaceAvatarProps): JSXElement {
  const initial = () =>
    props.name && props.name.length > 0 ? props.name.charAt(0) : '?'

  const hasColor = () => !!props.color
  const radius = () =>
    props.shape === 'square'
      ? props.size === 'lg'
        ? 'rounded-2xl'
        : 'rounded-xl'
      : 'rounded'

  return (
    <div
      class={clsx(
        'flex items-center justify-center flex-shrink-0',
        SIZE_CLASSES[props.size ?? 'md'],
        radius(),
        !hasColor() && (props.mutedFallback ? 'bg-base-300' : 'bg-primary/20'),
        props.class
      )}
      style={hasColor() ? { background: props.color! } : undefined}
    >
      <span
        class={clsx(
          'font-bold uppercase',
          hasColor()
            ? 'text-white'
            : props.mutedFallback
              ? undefined
              : 'text-primary',
          props.size === 'lg' && 'font-extrabold'
        )}
      >
        {initial()}
      </span>
    </div>
  )
}
