import {
  createEffect,
  JSXElement,
  onCleanup,
  Show,
  Accessor,
  Setter,
} from 'solid-js'
import clsx from 'clsx'

interface DropdownPanelProps {
  open: Accessor<boolean>
  setOpen: Setter<boolean>
  trigger: JSXElement
  children: JSXElement
  class?: string
}

export function DropdownPanel(props: DropdownPanelProps): JSXElement {
  let wrapperRef: HTMLDivElement | undefined

  const handleClickOutside = (e: MouseEvent) => {
    if (wrapperRef && !wrapperRef.contains(e.target as Node)) {
      props.setOpen(false)
    }
  }

  createEffect(() => {
    if (props.open()) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
    onCleanup(() => document.removeEventListener('click', handleClickOutside))
  })

  return (
    <div ref={wrapperRef} class="relative">
      {props.trigger}

      <Show when={props.open()}>
        <div
          class={clsx(
            'absolute top-full mt-2 right-0 bg-base-100 border border-base-300 rounded-xl shadow-lg z-50 overflow-hidden',
            props.class
          )}
        >
          {props.children}
        </div>
      </Show>
    </div>
  )
}
