import {
  createEffect,
  createSignal,
  For,
  JSXElement,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'
import { useNavigate, useSearchParams } from '@solidjs/router'
import clsx from 'clsx'

import { TranslationKey, useLocale } from '../context/LocaleProvider'
import { useWorkspace } from '../context/WorkspaceProvider'
import { WorkspaceListItemAttributes } from '../models/Workspace'
import { createModalState } from './Modal'
import { WorkspaceSettingsModal } from '../pages/workspace_modals/WorkspaceSettingsModal'
import { Alert } from './Alert'
import { createWorkspace, getErrorMessage } from '../api'

export function WorkspaceSwitcher(): JSXElement {
  const { t } = useLocale()
  const { workspaces, currentWorkspace, setCurrentWorkspace, fetchWorkspaces } =
    useWorkspace()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = createSignal(false)

  const [modalState, openModal, closeModal] = createModalState('settings')

  const [createError, setCreateError] = createSignal<TranslationKey | ''>('')
  const [creating, setCreating] = createSignal(false)

  const [billingStatus, setBillingStatus] = createSignal<
    'success' | 'cancelled' | 'method_updated' | null
  >(null)
  const [openOnBillingTab, setOpenOnBillingTab] = createSignal(false)
  const [openOnMembersTab, setOpenOnMembersTab] = createSignal(false)

  // Auto-open billing tab in settings modal after Mollie redirect
  let billingCheckDone = false
  createEffect(() => {
    const workspace = currentWorkspace()
    const status = searchParams.billing_status
    if (workspace && status && !billingCheckDone) {
      billingCheckDone = true
      const validStatuses = ['success', 'cancelled', 'method_updated'] as const
      const matched = validStatuses.find((s) => s === status)
      if (matched) {
        setBillingStatus(matched)
        openModal('settings')
        setSearchParams({ billing_status: undefined, workspace_id: undefined })
      }
    }
  })

  // Listen for open-billing-settings events (from FrozenWorkspaceModal)
  const handleOpenBillingEvent = () => {
    setOpenOnBillingTab(true)
    openModal('settings')
  }
  // Listen for open-members-settings events
  const handleOpenMembersEvent = () => {
    setOpenOnMembersTab(true)
    openModal('settings')
  }
  onMount(() => {
    window.addEventListener('open-billing-settings', handleOpenBillingEvent)
    window.addEventListener('open-members-settings', handleOpenMembersEvent)
  })
  onCleanup(() => {
    window.removeEventListener('open-billing-settings', handleOpenBillingEvent)
    window.removeEventListener('open-members-settings', handleOpenMembersEvent)
  })

  const handleCloseSettingsModal = () => {
    closeModal('settings')
    setBillingStatus(null)
    setOpenOnBillingTab(false)
    setOpenOnMembersTab(false)
  }

  const ws = () => currentWorkspace()
  const others = () =>
    workspaces().filter((w) => w.id !== currentWorkspace()?.id)

  const handleSwitch = (workspace: WorkspaceListItemAttributes) => {
    setCurrentWorkspace(workspace)
    setOpen(false)
    navigate('/home')
  }

  const handleCreateWorkspace = async () => {
    if (creating()) return
    setCreateError('')
    setCreating(true)
    const defaultName = t('workspace_name_placeholder')
    try {
      const response = await createWorkspace({ name: defaultName })
      const body = await response.json().catch(() => null)
      if (response.status !== 200 || !body?.id) {
        setCreateError(
          body ? getErrorMessage(body) : 'an_unknown_error_occurred'
        )
        setCreating(false)
        return
      }
      await fetchWorkspaces()
      const created = workspaces().find((w) => w.id === body.id)
      if (created) setCurrentWorkspace(created)
      setCreating(false)
      setOpen(false)
      navigate('/home')
    } catch {
      setCreateError('an_unknown_error_occurred')
      setCreating(false)
    }
  }

  return (
    <>
      <div class="relative px-2 pb-2">
        {/* Trigger */}
        <button
          class="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-base-300 transition-colors text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <div class="flex items-center gap-2 min-w-0">
            <div
              class={clsx(
                'w-6 h-6 rounded flex items-center justify-center flex-shrink-0',
                !ws()?.color && 'bg-primary/20'
              )}
              style={ws()?.color ? { background: ws()!.color! } : undefined}
            >
              <span
                class={clsx(
                  'text-xs font-bold uppercase',
                  ws()?.color ? 'text-white' : 'text-primary'
                )}
              >
                {ws()?.name?.charAt(0) ?? '?'}
              </span>
            </div>
            <span class="text-sm font-medium truncate">
              {ws()?.name ?? '...'}
            </span>
          </div>
          <i
            class={clsx(
              'fa-solid fa-chevron-down text-xs text-base-content/40 transition-transform flex-shrink-0',
              open() && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown */}
        <Show when={open()}>
          {/* Backdrop to close */}
          <div class="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div class="absolute left-2 right-2 top-full mt-1 z-50 bg-base-100 border border-base-300 rounded-xl shadow-lg overflow-hidden">
            {/* Current workspace actions */}
            <Show when={ws()}>
              <div class="px-3 pt-3 pb-1">
                <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2 truncate">
                  {ws()!.name}
                </p>
                <button
                  class="w-full flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg hover:bg-base-200 transition-colors"
                  onClick={() => {
                    setOpen(false)
                    openModal('settings')
                  }}
                >
                  <i class="fa-solid fa-gear w-4 text-center text-base-content/60" />
                  <span>{t('workspace_settings')}</span>
                </button>
              </div>
            </Show>

            {/* Other workspaces */}
            <Show when={others().length > 0}>
              <div class="divider my-1 mx-3" />
              <div class="px-3 pb-1">
                <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                  {t('switch_workspace')}
                </p>
                <For each={others()}>
                  {(w) => (
                    <button
                      class="w-full flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg hover:bg-base-200 transition-colors"
                      onClick={() => handleSwitch(w)}
                    >
                      <div
                        class={clsx(
                          'w-5 h-5 rounded flex items-center justify-center flex-shrink-0',
                          !w.color && 'bg-base-300'
                        )}
                        style={w.color ? { background: w.color } : undefined}
                      >
                        <span
                          class={clsx(
                            'text-xs font-bold uppercase',
                            w.color && 'text-white'
                          )}
                        >
                          {w.name.charAt(0)}
                        </span>
                      </div>
                      <span class="truncate">{w.name}</span>
                    </button>
                  )}
                </For>
              </div>
            </Show>

            <div class="divider my-1 mx-3" />

            {/* Create new */}
            <div class="px-3 pb-3">
              <button
                class="w-full flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg hover:bg-base-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => void handleCreateWorkspace()}
                disabled={creating()}
              >
                <i
                  class={clsx(
                    'w-4 text-center text-base-content/60',
                    creating()
                      ? 'fa-solid fa-spinner fa-spin'
                      : 'fa-solid fa-plus'
                  )}
                />
                <span>{t('create_workspace')}</span>
              </button>
              <Show when={createError()}>
                <Alert type="error" message={createError() as TranslationKey} />
              </Show>
            </div>
          </div>
        </Show>
      </div>

      {/* Settings modal */}
      <Show when={ws()}>
        {(currentWs) => (
          <WorkspaceSettingsModal
            isOpen={modalState().settings}
            onClose={handleCloseSettingsModal}
            workspaceId={currentWs().id}
            role={currentWs().role}
            initialTab={
              billingStatus() || openOnBillingTab()
                ? 'billing'
                : openOnMembersTab()
                  ? 'members'
                  : undefined
            }
            billingStatusMessage={billingStatus()}
          />
        )}
      </Show>
    </>
  )
}
