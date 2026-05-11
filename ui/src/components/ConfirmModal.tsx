import { JSXElement, Show } from 'solid-js'

import { Alert } from './Alert'
import { Button } from './Button'
import { Modal, ModalBaseProps } from './Modal'
import { useLocale } from '../context/LocaleProvider'

type DaisyUIColor = 'primary' | 'secondary' | 'error' | 'warning' | 'success'

interface ConfirmModalProps extends ModalBaseProps {
  title: string
  message?: JSXElement
  confirmLabel: string
  cancelLabel?: string
  confirmColor?: DaisyUIColor
  isLoading?: boolean
  errorMessage?: string | null
  confirmDataCy?: string
  onConfirm: () => void
  children?: JSXElement
}

/**
 * Generic confirmation modal used for destructive/irreversible actions
 * (delete, cancel subscription, leave workspace, remove member, etc.).
 */
export function ConfirmModal(props: ConfirmModalProps): JSXElement {
  const { t } = useLocale()

  return (
    <Modal title={props.title} isOpen={props.isOpen} onClose={props.onClose}>
      <Show when={props.message}>
        <p class="py-4">{props.message}</p>
      </Show>

      {props.children}

      <Show when={props.errorMessage}>
        <Alert type="error" message={props.errorMessage!} />
      </Show>

      <div class="modal-action">
        <Button
          label={props.cancelLabel ?? t('cancel')}
          variant="ghost"
          onClick={() => props.onClose()}
          disabled={props.isLoading}
        />
        <Button
          label={props.confirmLabel}
          color={props.confirmColor ?? 'error'}
          isLoading={props.isLoading}
          onClick={() => props.onConfirm()}
          dataCy={props.confirmDataCy}
        />
      </div>
    </Modal>
  )
}
