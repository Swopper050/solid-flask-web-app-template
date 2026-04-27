import { createEffect, createSignal, JSXElement, Show } from 'solid-js'
import clsx from 'clsx'

import { resolveUrl } from '../api'

interface AvatarProps {
  name?: string | null
  email?: string | null
  initials?: string | null
  profilePictureUrl?: string | null
  class?: string
}

const AVATAR_LIGHT = [
  { bg: '#e1f5ee', text: '#0f6e56' },
  { bg: '#cecbf6', text: '#3c3489' },
  { bg: '#b5d4f4', text: '#0c447c' },
  { bg: '#f4c0d1', text: '#72243e' },
  { bg: '#faeeda', text: '#854f0b' },
]

const AVATAR_DARK = [
  { bg: '#1f6e4a', text: '#b0e8cc' },
  { bg: '#5a4590', text: '#cfc4f0' },
  { bg: '#1e5580', text: '#aed0ee' },
  { bg: '#8a3550', text: '#f0bece' },
  { bg: '#7a5a18', text: '#eedcaa' },
]

function avatarColor(name: string): { bg: string; text: string } {
  const isDark =
    document.documentElement.getAttribute('data-theme') === 'dark'
  const palette = isDark ? AVATAR_DARK : AVATAR_LIGHT
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return palette[hash % palette.length]
}

function computeInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return '?'
}

export function Avatar(props: AvatarProps): JSXElement {
  const [imgError, setImgError] = createSignal(false)

  createEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    props.profilePictureUrl
    setImgError(false)
  })

  const label = () => props.name || props.email || '?'
  const colors = () => avatarColor(label())
  const displayInitials = () =>
    props.initials ?? computeInitials(props.name, props.email)

  const showPicture = () => !!props.profilePictureUrl && !imgError()
  const resolvedPictureUrl = () =>
    props.profilePictureUrl ? resolveUrl(props.profilePictureUrl) : null

  return (
    <div
      class={clsx(
        'rounded-full overflow-hidden flex items-center justify-center shrink-0 font-semibold',
        props.class
      )}
      style={
        showPicture()
          ? undefined
          : { background: colors().bg, color: colors().text }
      }
    >
      <Show when={showPicture()}>
        <img
          src={resolvedPictureUrl()!}
          class="w-full h-full object-cover"
          onError={() => setImgError(true)}
          alt=""
        />
      </Show>
      <Show when={!showPicture()}>{displayInitials()}</Show>
    </div>
  )
}
