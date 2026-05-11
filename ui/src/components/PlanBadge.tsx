import clsx from 'clsx'
import { JSXElement } from 'solid-js'

type PlanBadgeColor = 'success' | 'primary'

const COLOR_CLASSES: Record<PlanBadgeColor, string> = {
  success: 'text-success bg-success/15',
  primary: 'text-primary bg-primary/15',
}

interface PlanBadgeProps {
  label?: string
  color?: PlanBadgeColor
  size?: 'sm' | 'md'
}

/** Small "Pro" pill shown next to paid/exempt workspaces. */
export function PlanBadge(props: PlanBadgeProps): JSXElement {
  return (
    <span
      class={clsx(
        'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-full',
        props.size === 'sm' ? 'px-1.5 py-0.5' : 'px-2.5 py-1',
        COLOR_CLASSES[props.color ?? 'success']
      )}
    >
      <i class="fa-solid fa-star text-[8px]" />
      {props.label ?? 'Pro'}
    </span>
  )
}
