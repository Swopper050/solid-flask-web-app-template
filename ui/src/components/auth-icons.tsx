import { JSXElement, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'

interface IconProps {
  size?: number
  strokeWidth?: number
  class?: string
}

type SvgAttrs = JSX.SvgSVGAttributes<SVGSVGElement>

function baseSvgAttrs(props: IconProps, defaultStroke = 2): SvgAttrs {
  const [, rest] = splitProps(props, ['size', 'strokeWidth'])
  return {
    get width() {
      return props.size ?? 15
    },
    get height() {
      return props.size ?? 15
    },
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    get ['stroke-width']() {
      return props.strokeWidth ?? defaultStroke
    },
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    ...rest,
  }
}

export function EnvelopeIcon(props: IconProps = {}): JSXElement {
  return (
    <svg {...baseSvgAttrs(props)}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

export function LockIcon(props: IconProps = {}): JSXElement {
  return (
    <svg {...baseSvgAttrs(props)}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export function UserIcon(props: IconProps = {}): JSXElement {
  return (
    <svg {...baseSvgAttrs(props)}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export function ShieldIcon(props: IconProps = {}): JSXElement {
  return (
    <svg {...baseSvgAttrs(props)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps = {}): JSXElement {
  return (
    <svg {...baseSvgAttrs(props, 2.5)}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export function AppLogo(props: { size?: number } = {}): JSXElement {
  return (
    <svg
      width={props.size ?? 28}
      height={props.size ?? 28}
      viewBox="0 0 64 64"
      fill="none"
    >
      <rect width="64" height="64" rx="14" fill="var(--color-primary)" />
      <polygon points="32,12 20,36 30,36 28,52 44,28 34,28" fill="white" />
    </svg>
  )
}
