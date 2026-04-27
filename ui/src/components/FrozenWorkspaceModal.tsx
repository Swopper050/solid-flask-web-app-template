import { JSXElement, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import clsx from 'clsx'

import { Button } from './Button'
import { useLocale } from '../context/LocaleProvider'
import type { FrozenReason } from '../models/Workspace'

/** Dispatch this event to open the workspace settings modal on the billing tab. */
export function dispatchOpenBillingSettings(): void {
  window.dispatchEvent(new CustomEvent('open-billing-settings'))
}

interface Props {
  isOpen: boolean
  onClose: () => void
  frozenReason: FrozenReason
}

export function FrozenWorkspaceModal(props: Props): JSXElement {
  const { t } = useLocale()

  const isTrialExpired = () => props.frozenReason === 'trial_expired'

  return (
    <Portal mount={document.body}>
      <dialog
        class={clsx(
          'modal z-1000',
          props.isOpen ? 'modal-open' : 'modal-close'
        )}
      >
        <div class="modal-box w-90vw max-w-md p-8">
          {/* Warning icon */}
          <div class="flex h-13 w-13 items-center justify-center rounded-xl bg-orange-50 mb-5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7"
            >
              <path
                d="M4.93 19h14.14c1.34 0 2.17-1.46 1.49-2.62L13.49 4.01c-.68-1.17-2.3-1.17-2.98 0L3.44 16.38C2.76 17.54 3.59 19 4.93 19z"
                stroke="#E67E22"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
              <line
                x1="12"
                y1="9.5"
                x2="12"
                y2="13"
                stroke="#E67E22"
                stroke-width="2"
                stroke-linecap="round"
              />
              <circle cx="12" cy="15.5" r="1" fill="#E67E22" />
            </svg>
          </div>

          {/* Title */}
          <h3 class="text-xl font-bold text-base-content mb-2.5">
            <Show
              when={isTrialExpired()}
              fallback={t('frozen_subscription_title')}
            >
              {t('frozen_trial_title')}
            </Show>
          </h3>

          {/* Description */}
          <p class="text-sm text-base-content/60 leading-relaxed mb-7">
            <Show
              when={isTrialExpired()}
              fallback={t('frozen_subscription_description')}
            >
              {t('frozen_trial_description')}
            </Show>
          </p>

          {/* Actions */}
          <div class="flex justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              class="h-10 px-6 text-sm font-semibold"
              onClick={() => props.onClose()}
              label={
                <Show when={isTrialExpired()} fallback={t('close')}>
                  {t('later')}
                </Show>
              }
            />
            <Button
              size="sm"
              class="h-10 px-6 text-sm font-semibold border-0 text-white"
              style={{ background: '#95a5a6' }}
              disabled={true}
              label={
                <Show
                  when={isTrialExpired()}
                  fallback={t('frozen_subscribe_button')}
                >
                  {t('frozen_upgrade_button')}
                </Show>
              }
            />
          </div>
          <p class="text-xs text-base-content/50 mt-2 text-right">
            {t('upgrade_available_soon')}
          </p>
        </div>

        <div class="modal-backdrop" onClick={() => props.onClose()} />
      </dialog>
    </Portal>
  )
}
