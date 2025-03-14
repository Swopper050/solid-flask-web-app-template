import clsx from 'clsx'
import { createSignal, JSXElement } from 'solid-js'

/**
 * Creates a modal state that can be used to open and close modals
 * the keys passed in are used as identifiers for identifying differnent modals.
 */
export function createModalState<T extends string>(...keys: T[]) {
  const initialState = Object.fromEntries(
    keys.map((key) => [key, false])
  ) as Record<T, boolean>

  const [modalState, setModalState] = createSignal(initialState)

  const openModal = (modal: T) => {
    setModalState((prev) => ({ ...prev, [modal]: true }))
  }

  const closeModal = (modal: T) => {
    setModalState((prev) => ({ ...prev, [modal]: false }))
  }

  return [modalState, openModal, closeModal] as const
}

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
        <div class="modal-box w-90vw max-w-sm sm:max-w-md">
          <button
            class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            onClick={() => props.onClose()}
          >
            ✕
          </button>
          <h3 class="font-bold text-lg">{props.title}</h3>
          {props.children}
        </div>

        <div class="modal-backdrop" onClick={() => props.onClose()} />
      </dialog>
    </>
  )
}
