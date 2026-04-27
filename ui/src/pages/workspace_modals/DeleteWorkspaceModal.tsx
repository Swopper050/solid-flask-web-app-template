import { createEffect, createSignal, JSXElement } from 'solid-js'
import { Portal } from 'solid-js/web'
import clsx from 'clsx'

import { Button } from '../../components/Button'
import { useLocale } from '../../context/LocaleProvider'

interface Props {
  isOpen: boolean
  workspaceName: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteWorkspaceModal(props: Props): JSXElement {
  const { t } = useLocale()
  const [confirmName, setConfirmName] = createSignal('')

  createEffect(() => {
    if (!props.isOpen) {
      setConfirmName('')
    }
  })

  return (
    <Portal mount={document.body}>
      <dialog class={clsx('modal z-[1200]', props.isOpen ? 'modal-open' : '')}>
        <div class="modal-box w-full max-w-[420px] p-0 rounded-2xl overflow-hidden">
          {/* Body */}
          <div class="px-6 pt-6 pb-5">
            {/* Red warning icon */}
            <div class="w-11 h-11 rounded-xl bg-error/10 flex items-center justify-center mb-4 text-error">
              <i class="fa-solid fa-trash text-lg" />
            </div>

            {/* Title */}
            <h3 class="text-base font-extrabold text-base-content tracking-tight mb-2">
              {t('danger_zone')}
            </h3>

            {/* Description */}
            <p class="text-[13.5px] text-base-content/60 leading-relaxed">
              {t('delete_workspace_confirmation')}
            </p>

            {/* Confirmation input */}
            <label class="input input-bordered input-sm flex items-center mt-4 w-full">
              <input
                type="text"
                class="grow"
                placeholder={props.workspaceName}
                value={confirmName()}
                onInput={(e) => setConfirmName(e.currentTarget.value)}
              />
            </label>
            <p class="text-xs text-base-content/50 mt-1">
              {t('type_workspace_name_to_confirm')}
            </p>
          </div>

          {/* Footer */}
          <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-base-100">
            <Button
              variant="ghost"
              size="sm"
              class="px-4 py-2 rounded-[10px] text-[13.5px] font-semibold text-base-content/60 border-[1.5px] border-base-200 hover:border-base-300 hover:bg-base-200/50 hover:text-base-content transition-all"
              onClick={() => props.onCancel()}
              label={t('cancel')}
            />
            <Button
              label={t('yes_delete')}
              color="error"
              size="sm"
              disabled={confirmName() !== props.workspaceName}
              isLoading={props.isDeleting}
              onClick={props.onConfirm}
            />
          </div>
        </div>
        <div class="modal-backdrop" onClick={() => props.onCancel()} />
      </dialog>
    </Portal>
  )
}
