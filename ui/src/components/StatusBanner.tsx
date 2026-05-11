import clsx from 'clsx'
import { JSXElement } from 'solid-js'

type BannerType = 'info' | 'success' | 'warning' | 'error'

const BANNER_CONFIG: Record<BannerType, { tint: string; icon: string }> = {
  info: { tint: 'bg-info/10 border-info/20 text-info', icon: 'fa-circle-info' },
  success: {
    tint: 'bg-primary/10 border-primary/20 text-primary',
    icon: 'fa-circle-check',
  },
  warning: {
    tint: 'bg-warning/10 border-warning/20 text-warning',
    icon: 'fa-circle-exclamation',
  },
  error: {
    tint: 'bg-error/10 border-error/20 text-error',
    icon: 'fa-circle-xmark',
  },
}

interface StatusBannerProps {
  type: BannerType
  message: JSXElement
  class?: string
}

/**
 * Compact inline status pill (border + tinted background) used for
 * billing/checkout feedback messages.
 */
export function StatusBanner(props: StatusBannerProps): JSXElement {
  const cfg = () => BANNER_CONFIG[props.type]

  return (
    <div
      class={clsx(
        'flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium',
        cfg().tint,
        props.class
      )}
    >
      <i class={clsx('fa-solid text-xs', cfg().icon)} />
      <span>{props.message}</span>
    </div>
  )
}
