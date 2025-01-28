import clsx from 'clsx'
import { JSXElement } from 'solid-js'

export interface ModalBaseProps {
  isOpen: boolean
  onClose: () => void
}

export function Modal(props: {
  title: string
  isOpen: boolean
  children: JSXElement | JSXElement[]
  onClose: () => void
}): JSXElement {
  const isOpen = () => props.isOpen

  return (
    <>
      <dialog class={clsx('modal', isOpen() ? 'modal-open' : 'modal-close')}>
        <div class="modal-box">
          <button
            class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            onClick={() => props.onClose()}
          >
            ✕
          </button>
          <h3 class="font-bold text-lg">{props.title}</h3>
          {props.children}
        </div>
      </dialog>
    </>
  )
}
