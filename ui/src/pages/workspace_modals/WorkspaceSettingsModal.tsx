import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  JSXElement,
  onCleanup,
  Show,
  Suspense,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import { email, getValues, required, setValue } from '@modular-forms/solid'
import clsx from 'clsx'

import { DeleteWorkspaceModal } from './DeleteWorkspaceModal'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { ModalBaseProps } from '../../components/Modal'
import { TextInput } from '../../components/TextInput'
import { TranslationKey, useLocale } from '../../context/LocaleProvider'
import { useUser } from '../../context/UserProvider'
import { useWorkspace } from '../../context/WorkspaceProvider'
import { createFormState } from '../../form_helpers'
import {
  cancelInvitation,
  deleteWorkspace,
  getBillingStatus,
  getInvitations,
  getWorkspace,
  inviteMember,
  removeMember,
  updateMemberRole,
  updateWorkspace,
} from '../../api'
import { BillingTabContent } from '../billing/BillingTabContent'
import { BillingStatusAttributes } from '../../models/Billing'
import {
  WORKSPACE_LANGUAGES,
  WorkspaceAttributes,
  WorkspaceInvitationAttributes,
  WorkspaceLanguage,
} from '../../models/Workspace'

type RenameForm = { name: string }

type InviteForm = { email: string }

interface Props extends ModalBaseProps {
  workspaceId: number
  role: 'owner' | 'admin' | 'member'
  initialTab?: Tab
  billingStatusMessage?: 'success' | 'cancelled' | 'method_updated' | null
}

type Tab = 'general' | 'members' | 'billing'

const WORKSPACE_COLORS = [
  '#1CB87E',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#EF4444',
  '#1A1A2E',
]

const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',
]

function getInitials(name: string | undefined, email: string): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.trim().substring(0, 2).toUpperCase()
  }
  return email.substring(0, 2).toUpperCase()
}

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

type WorkspaceRole = 'admin' | 'member'

const WORKSPACE_ROLE_CONFIG: Record<
  WorkspaceRole,
  { translationKey: TranslationKey; descKey: TranslationKey; dot: string }
> = {
  admin: {
    translationKey: 'workspace_role_admin',
    descKey: 'workspace_role_admin_desc',
    dot: '#8b5cf6',
  },
  member: {
    translationKey: 'workspace_role_member',
    descKey: 'workspace_role_member_desc',
    dot: '#3b82f6',
  },
}

function WorkspaceRolePicker(props: {
  role: WorkspaceRole
  onChange: (role: WorkspaceRole) => void
  disabled?: boolean
  loading?: boolean
}): JSXElement {
  const { t } = useLocale()
  const [open, setOpen] = createSignal(false)
  const [menuPos, setMenuPos] = createSignal({ top: 0, left: 0 })
  let containerRef: HTMLDivElement | undefined
  let menuRef: HTMLDivElement | undefined
  let btnRef: HTMLButtonElement | undefined

  const handleClick = () => {
    if (props.disabled || props.loading) return
    if (!open() && btnRef) {
      const rect = btnRef.getBoundingClientRect()
      const menuW = 212
      let left = rect.right - menuW
      if (left < 8) left = 8
      setMenuPos({ top: rect.bottom + 6, left })
    }
    setOpen(!open())
  }

  const selectRole = (role: WorkspaceRole) => {
    props.onChange(role)
    setOpen(false)
  }

  const handleDocClick = (e: MouseEvent) => {
    const target = e.target as Node
    if (
      containerRef &&
      !containerRef.contains(target) &&
      (!menuRef || !menuRef.contains(target))
    ) {
      setOpen(false)
    }
  }
  document.addEventListener('click', handleDocClick)
  onCleanup(() => document.removeEventListener('click', handleDocClick))

  const handleScroll = (e: Event) => {
    if (menuRef && menuRef.contains(e.target as Node)) return
    setOpen(false)
  }
  document.addEventListener('scroll', handleScroll, true)
  onCleanup(() => document.removeEventListener('scroll', handleScroll, true))

  const cfg = () => WORKSPACE_ROLE_CONFIG[props.role]

  return (
    <div class="flex-shrink-0" ref={containerRef}>
      <button
        ref={btnRef}
        type="button"
        class={clsx(
          'inline-flex items-center gap-1.5 px-2 py-1 border rounded-full text-xs font-semibold transition-all whitespace-nowrap',
          open()
            ? 'border-primary bg-primary/5'
            : 'border-base-300 bg-base-100 hover:border-primary hover:bg-primary/5',
          (props.disabled || props.loading) && 'opacity-50 cursor-default'
        )}
        onClick={handleClick}
      >
        <Show
          when={!props.loading}
          fallback={<span class="loading loading-spinner w-3 h-3" />}
        >
          <span
            class="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: cfg().dot }}
          />
        </Show>
        {t(cfg().translationKey)}
        <Show when={!props.disabled && !props.loading}>
          <svg
            class={clsx(
              'w-2.5 h-2.5 text-base-content/40 transition-transform',
              open() && 'rotate-180'
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </Show>
      </button>

      <Show when={open()}>
        <Portal mount={document.body}>
          <div
            ref={menuRef}
            class="fixed w-[212px] bg-base-100 border border-base-300 rounded-xl shadow-lg z-[1100] p-1"
            style={{
              top: `${menuPos().top}px`,
              left: `${menuPos().left}px`,
            }}
          >
            <For each={['admin', 'member'] as WorkspaceRole[]}>
              {(role) => {
                const rc = WORKSPACE_ROLE_CONFIG[role]
                return (
                  <button
                    type="button"
                    class={clsx(
                      'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left transition-colors',
                      props.role === role ? 'bg-primary/5' : 'hover:bg-base-200'
                    )}
                    onClick={() => selectRole(role)}
                  >
                    <span
                      class="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: rc.dot }}
                    />
                    <div class="flex-1 min-w-0">
                      <div class="text-xs font-semibold">
                        {t(rc.translationKey)}
                      </div>
                      <div class="text-[10px] text-base-content/50 leading-tight">
                        {t(rc.descKey)}
                      </div>
                    </div>
                    <Show when={props.role === role}>
                      <div class="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          stroke-width="3.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </Show>
                  </button>
                )
              }}
            </For>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

export function WorkspaceSettingsModal(props: Props): JSXElement {
  const { t } = useLocale()
  const { user } = useUser()
  const { fetchWorkspaces, setCurrentWorkspace, workspaces } = useWorkspace()
  const [tab, setTab] = createSignal<Tab>(props.initialTab ?? 'general')

  createEffect(() => {
    if (props.isOpen && props.initialTab) {
      setTab(props.initialTab)
    }
  })

  const [confirmDelete, setConfirmDelete] = createSignal(false)
  const [deletingWorkspace, setDeletingWorkspace] = createSignal(false)
  const [removingMember, setRemovingMember] = createSignal<number | null>(null)
  const [confirmRemoveMember, setConfirmRemoveMember] = createSignal<{
    userId: number
    name: string
  } | null>(null)
  const [confirmLeave, setConfirmLeave] = createSignal(false)
  const [leavingWorkspace, setLeavingWorkspace] = createSignal(false)
  const [leaveError, setLeaveError] = createSignal<string | null>(null)
  const [promotingMember, setPromotingMember] = createSignal<number | null>(
    null
  )
  const [wsColor, setWsColor] = createSignal<string | null>(null)
  const [wsDescription, setWsDescription] = createSignal('')
  const [wsLanguage, setWsLanguage] = createSignal<WorkspaceLanguage>('nl')
  const [generalSaveResult, setGeneralSaveResult] = createSignal<
    'success' | 'error' | ''
  >('')

  const [workspace, { refetch }] = createResource(
    () => (props.isOpen ? props.workspaceId : null),
    (id) => getWorkspace(id),
    { initialValue: undefined as WorkspaceAttributes | undefined }
  )

  const workspaceListItem = () =>
    workspaces().find((w) => w.id === props.workspaceId) ?? null

  const [billingStatus] = createResource(
    () => (props.isOpen ? props.workspaceId : null),
    (id) => getBillingStatus(id),
    { initialValue: undefined as BillingStatusAttributes | undefined }
  )

  const isPro = () => {
    const b = billingStatus.latest
    if (!b) return false
    return b.billing_exempt || (b.plan === 'paid' && b.status === 'active')
  }

  const isOwner = () => props.role === 'owner'
  const isOwnerOrAdmin = () => props.role === 'owner' || props.role === 'admin'
  const otherAdminsExist = () => {
    const ws = workspace.latest
    if (!ws) return false
    return (
      ws.members.filter(
        (m: { role: string; user_id: number }) =>
          (m.role === 'owner' || m.role === 'admin') && m.user_id !== user()?.id
      ).length > 0
    )
  }

  const {
    state: renameState,
    onSubmit: renameSubmit,
    components: { Form: RenameForm, Field: RenameField },
  } = createFormState<RenameForm, WorkspaceAttributes>({
    action: (values) =>
      updateWorkspace(props.workspaceId, {
        name: values.name,
        color: wsColor(),
        context: wsDescription() || null,
        language: wsLanguage(),
      }),
    onFinish: async () => {
      setGeneralSaveResult('success')
      setTimeout(() => setGeneralSaveResult(''), 3000)
      await fetchWorkspaces()
      refetch()
    },
    resetOnFinish: false,
  })

  let inviteInputRef: HTMLInputElement | undefined

  const [invitations, { refetch: refetchInvitations }] = createResource(
    () => (props.isOpen && tab() === 'members' ? props.workspaceId : null),
    (id) => getInvitations(id),
    { initialValue: [] }
  )

  const {
    state: inviteState,
    onSubmit: inviteSubmit,
    components: { Form: InviteForm, Field: InviteField },
  } = createFormState<InviteForm, WorkspaceInvitationAttributes>({
    action: (values) => inviteMember(props.workspaceId, values.email),
    onFinish: () => {
      refetchInvitations()
      refetch()
      window.dispatchEvent(new CustomEvent('workspace-invitations-changed'))
      setTimeout(() => inviteInputRef?.focus(), 0)
    },
  })

  const handleCancelInvitation = async (invitationId: number) => {
    await cancelInvitation(props.workspaceId, invitationId)
    refetchInvitations()
    window.dispatchEvent(new CustomEvent('workspace-invitations-changed'))
  }

  createEffect(() => {
    const ws = workspace.latest
    if (ws) {
      setValue(renameState, 'name', ws.name)
      setWsColor(ws.color ?? null)
      setWsDescription(ws.context ?? '')
      setWsLanguage(ws.language ?? 'nl')
    }
  })

  const generalHasChanges = createMemo(() => {
    const ws = workspace.latest
    if (!ws) return false
    const formValues = getValues(renameState)
    return (
      (formValues.name ?? '') !== ws.name ||
      wsColor() !== (ws.color ?? null) ||
      wsDescription() !== (ws.context ?? '') ||
      wsLanguage() !== (ws.language ?? 'nl')
    )
  })

  createEffect(() => {
    if (!props.isOpen) {
      setGeneralSaveResult('')
    }
  })

  const handleChangeRole = async (userId: number, role: WorkspaceRole) => {
    setPromotingMember(userId)
    await updateMemberRole(props.workspaceId, userId, role)
    await fetchWorkspaces()
    refetch()
    setPromotingMember(null)
  }

  const handleRemoveMember = async (userId: number) => {
    setRemovingMember(userId)
    await removeMember(props.workspaceId, userId)
    await fetchWorkspaces()
    refetch()
    setRemovingMember(null)
  }

  const handleLeaveWorkspace = async () => {
    setLeavingWorkspace(true)
    setLeaveError(null)
    try {
      const userId = user()?.id
      if (!userId) return
      const resp = await removeMember(props.workspaceId, userId)
      if (!resp.ok) {
        const data = await resp.json()
        setLeaveError(data.message || t('an_unknown_error_occurred'))
        setLeavingWorkspace(false)
        return
      }
      await fetchWorkspaces()
      const remaining = workspaces()
      if (remaining.length > 0) setCurrentWorkspace(remaining[0])
      setLeavingWorkspace(false)
      setConfirmLeave(false)
      props.onClose()
    } catch {
      setLeaveError(t('an_unknown_error_occurred'))
      setLeavingWorkspace(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    setDeletingWorkspace(true)
    await deleteWorkspace(props.workspaceId)
    await fetchWorkspaces()
    const remaining = workspaces()
    if (remaining.length > 0) setCurrentWorkspace(remaining[0])
    setDeletingWorkspace(false)
    setConfirmDelete(false)
    props.onClose()
  }

  const wsInitial = () => {
    const name = workspace.latest?.name ?? workspaceListItem()?.name
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  const activeColor = () => wsColor() ?? workspaceListItem()?.color ?? '#1CB87E'

  const memberCount = () =>
    workspace.latest?.members?.length ?? workspaceListItem()?.member_count ?? 0

  const panelTitle = () => {
    switch (tab()) {
      case 'general':
        return t('general')
      case 'members':
        return t('members')
      case 'billing':
        return t('billing')
    }
  }

  const panelSubtitle = () => {
    switch (tab()) {
      case 'general':
        return t('workspace_settings_subtitle')
      case 'members':
        return t('workspace_members_subtitle')
      case 'billing':
        return t('billing_subtitle')
    }
  }

  return (
    <>
      <Portal mount={document.body}>
        <dialog
          class={clsx(
            'modal z-1000',
            props.isOpen ? 'modal-open' : 'modal-close'
          )}
        >
          {/* Modal container — sidebar layout (stacks on mobile) */}
          <div class="modal-box bg-base-100 rounded-2xl w-[95vw] max-w-[860px] h-auto md:h-[680px] max-h-[90vh] flex flex-col md:flex-row shadow-2xl overflow-hidden relative !p-0">
            {/* Close button */}
            <button
              class="absolute top-3 right-3 z-30 w-8 h-8 rounded-lg bg-base-200 hover:bg-base-300 flex items-center justify-center text-base-content/40 hover:text-base-content transition-all"
              onClick={() => props.onClose()}
            >
              <i class="fa-solid fa-xmark text-sm" />
            </button>

            {/* ── SIDEBAR ── */}
            <div class="w-full md:w-[204px] md:flex-shrink-0 bg-base-200/50 border-b md:border-b-0 md:border-r border-base-300 flex flex-col">
              {/* Sidebar header */}
              <div class="flex md:block items-center gap-3 px-4 md:px-5 pt-4 md:pt-7 pb-3 md:pb-5 pr-12 md:pr-5 border-b border-base-300">
                <div
                  class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white text-base md:text-xl font-extrabold md:mb-3 flex-shrink-0 transition-colors"
                  style={{ background: activeColor() }}
                >
                  {wsInitial()}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-extrabold text-sm text-base-content truncate md:mb-1.5">
                    {workspace.latest?.name ??
                      workspaceListItem()?.name ??
                      '...'}
                  </div>
                  <Show when={isPro()}>
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Pro
                    </span>
                  </Show>
                </div>
              </div>

              {/* Navigation */}
              <nav class="flex md:flex-col flex-1 overflow-x-auto md:overflow-x-visible p-2 md:p-2.5 gap-1 md:gap-0.5">
                <button
                  class={clsx(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-semibold md:w-full md:text-left whitespace-nowrap transition-all',
                    tab() === 'general'
                      ? 'bg-primary/10 text-primary'
                      : 'text-base-content/60 hover:bg-base-300 hover:text-base-content'
                  )}
                  onClick={() => setTab('general')}
                >
                  <i
                    class={clsx(
                      'fa-solid fa-sliders w-4 text-center text-sm',
                      tab() === 'general'
                        ? 'text-primary'
                        : 'text-base-content/40'
                    )}
                  />
                  {t('general')}
                </button>

                <button
                  class={clsx(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-semibold md:w-full md:text-left whitespace-nowrap transition-all',
                    tab() === 'members'
                      ? 'bg-primary/10 text-primary'
                      : 'text-base-content/60 hover:bg-base-300 hover:text-base-content'
                  )}
                  onClick={() => setTab('members')}
                >
                  <i
                    class={clsx(
                      'fa-solid fa-users w-4 text-center text-sm',
                      tab() === 'members'
                        ? 'text-primary'
                        : 'text-base-content/40'
                    )}
                  />
                  {t('members')}
                  <span
                    class={clsx(
                      'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                      tab() === 'members'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-base-300 text-base-content/60'
                    )}
                  >
                    {memberCount()}
                  </span>
                </button>

                <Show when={isOwnerOrAdmin()}>
                  <button
                    class={clsx(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-semibold md:w-full md:text-left whitespace-nowrap transition-all',
                      tab() === 'billing'
                        ? 'bg-primary/10 text-primary'
                        : 'text-base-content/60 hover:bg-base-300 hover:text-base-content'
                    )}
                    onClick={() => setTab('billing')}
                  >
                    <i
                      class={clsx(
                        'fa-solid fa-credit-card w-4 text-center text-sm',
                        tab() === 'billing'
                          ? 'text-primary'
                          : 'text-base-content/40'
                      )}
                    />
                    {t('billing')}
                  </button>
                </Show>

                {/* Separator + Delete */}
                <Show when={isOwner()}>
                  <div class="hidden md:block h-px bg-base-300 my-2 mx-2.5" />
                  <button
                    class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-semibold md:w-full md:text-left whitespace-nowrap text-error hover:bg-error/10 transition-all"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <i class="fa-solid fa-trash w-4 text-center text-sm opacity-60" />
                    {t('workspace_delete')}
                  </button>
                </Show>
              </nav>
            </div>

            {/* ── CONTENT ── */}
            <div class="flex-1 min-w-0 flex flex-col overflow-hidden">
              {/* Panel header */}
              <div class="px-5 md:px-7 pt-4 md:pt-6 pb-4 md:pb-5 border-b border-base-200">
                <h3 class="font-extrabold text-base text-base-content tracking-tight mb-0.5">
                  {panelTitle()}
                </h3>
                <p class="text-xs text-base-content/40">{panelSubtitle()}</p>
              </div>

              {/* ── General tab ── */}
              <Show when={tab() === 'general'}>
                <Show when={workspace.latest} fallback={<GeneralTabSkeleton />}>
                  <Show
                    when={isOwnerOrAdmin()}
                    fallback={
                      <div class="flex-1 px-5 md:px-7 py-4 md:py-5">
                        <p class="text-xs font-semibold text-base-content/50 mb-1">
                          {t('workspace_name')}
                        </p>
                        <p class="text-sm font-semibold">
                          {workspace.latest?.name}
                        </p>
                      </div>
                    }
                  >
                    <RenameForm
                      onSubmit={renameSubmit}
                      class="flex-1 flex flex-col overflow-hidden"
                    >
                      <div class="flex-1 px-5 md:px-7 py-4 md:py-5 overflow-y-auto">
                        {/* Icon & color picker */}
                        <div class="mb-5">
                          <label class="block text-[13px] font-semibold text-base-content mb-2">
                            {t('workspace_icon_and_color')}
                          </label>
                          <div class="flex items-center gap-4 p-4 bg-base-200/50 border border-base-300 rounded-xl">
                            <div
                              class="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-[22px] font-extrabold flex-shrink-0 transition-colors"
                              style={{ background: activeColor() }}
                            >
                              {wsInitial()}
                            </div>
                            <div class="flex-1">
                              <div class="text-[11.5px] font-semibold text-base-content/60 mb-2">
                                {t('workspace_color_label')}
                              </div>
                              <div class="flex gap-2 flex-wrap">
                                <For each={WORKSPACE_COLORS}>
                                  {(color) => (
                                    <button
                                      type="button"
                                      class={clsx(
                                        'w-[22px] h-[22px] rounded-full cursor-pointer transition-transform hover:scale-110',
                                        activeColor() === color
                                          ? 'ring-2 ring-base-content ring-offset-2'
                                          : 'ring-0'
                                      )}
                                      style={{ background: color }}
                                      onClick={() => setWsColor(color)}
                                    />
                                  )}
                                </For>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Workspace name */}
                        <div class="mb-5">
                          <RenameField
                            name="name"
                            validate={[
                              required(t('please_enter_a_workspace_name')),
                            ]}
                          >
                            {(field, fieldProps) => (
                              <TextInput
                                {...fieldProps}
                                type="text"
                                label={t('workspace_name')}
                                value={field.value ?? ''}
                                error={field.error}
                                placeholder={t('workspace_name_placeholder')}
                              />
                            )}
                          </RenameField>
                        </div>

                        {/* Workspace description */}
                        <div class="mb-5">
                          <label class="block text-[13px] font-semibold text-base-content mb-2">
                            {t('workspace_description')}
                          </label>
                          <textarea
                            class="w-full px-3 py-2.5 border border-base-300 rounded-lg text-sm bg-base-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-y min-h-[72px] leading-relaxed"
                            value={wsDescription()}
                            onInput={(e) =>
                              setWsDescription(e.currentTarget.value)
                            }
                            placeholder={t('workspace_description_placeholder')}
                          />
                          <p class="text-xs text-base-content/40 mt-1 leading-relaxed">
                            {t('workspace_description_help')}
                          </p>
                        </div>

                        {/* Workspace language */}
                        <div class="mb-5">
                          <label class="block text-[13px] font-semibold text-base-content mb-2">
                            {t('workspace_language')}
                          </label>
                          <select
                            class="w-full px-3 py-2.5 border border-base-300 rounded-lg text-sm bg-base-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            value={wsLanguage()}
                            onChange={(e) =>
                              setWsLanguage(
                                e.currentTarget.value as WorkspaceLanguage
                              )
                            }
                          >
                            <For each={WORKSPACE_LANGUAGES}>
                              {(lang) => (
                                <option value={lang}>
                                  {t(
                                    lang === 'nl'
                                      ? 'workspace_language_nl'
                                      : 'workspace_language_en'
                                  )}
                                </option>
                              )}
                            </For>
                          </select>
                          <p class="text-xs text-base-content/40 mt-1 leading-relaxed">
                            {t('workspace_language_help')}
                          </p>
                        </div>

                        <Show when={renameState.response.status === 'error'}>
                          <Alert
                            type="error"
                            message={renameState.response.message}
                          />
                        </Show>
                        <Show
                          when={
                            renameState.response.status === 'success' ||
                            generalSaveResult() === 'success'
                          }
                        >
                          <div class="flex items-center gap-2 mt-4 px-3 py-2.5 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary font-medium">
                            <i class="fa-solid fa-circle-check text-xs" />
                            {t('workspace_saved')}
                          </div>
                        </Show>
                      </div>

                      <SettingsFooter
                        hasChanges={generalHasChanges()}
                        onCancel={() => props.onClose()}
                        saveType="submit"
                        isLoading={renameState.submitting}
                        unsavedLabel={t('you_have_unsaved_changes')}
                        cancelLabel={t('cancel')}
                        saveLabel={t('save')}
                      />
                    </RenameForm>
                  </Show>
                </Show>
              </Show>

              {/* ── Members tab ── */}
              <Show when={tab() === 'members'}>
                <Suspense fallback={<MembersListSkeleton />}>
                  <div class="flex-1 px-5 md:px-7 py-4 md:py-5 overflow-y-auto">
                    <Show
                      when={workspace.latest}
                      fallback={<MembersListSkeleton />}
                    >
                      {(ws) => (
                        <>
                          <Show when={isOwnerOrAdmin() && !otherAdminsExist()}>
                            <p class="text-xs text-base-content/40 leading-relaxed mb-2">
                              {t('cannot_leave_last_owner')}
                            </p>
                          </Show>

                          <div class="border border-base-300 rounded-xl overflow-hidden mb-3">
                            <For each={ws().members}>
                              {(member, index) => (
                                <div class="flex items-center gap-3 px-3.5 py-2.5 border-b border-base-200 last:border-b-0 hover:bg-base-200/50 transition-colors">
                                  {/* Avatar */}
                                  <div
                                    class={clsx(
                                      'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0',
                                      getAvatarColor(index())
                                    )}
                                  >
                                    {getInitials(member.name, member.email)}
                                  </div>

                                  {/* Info */}
                                  <div class="flex-1 min-w-0">
                                    <div class="text-[13px] font-semibold text-base-content truncate">
                                      {member.name || member.email}
                                      <Show
                                        when={member.user_id === user()?.id}
                                      >
                                        <span class="text-[11px] font-medium text-base-content/40 ml-1">
                                          ({t('you')})
                                        </span>
                                      </Show>
                                    </div>
                                    <div class="text-[11px] text-base-content/40 truncate">
                                      {member.email}
                                    </div>
                                  </div>

                                  {/* Role */}
                                  <Show
                                    when={
                                      isOwnerOrAdmin() &&
                                      (member.user_id !== user()?.id ||
                                        otherAdminsExist())
                                    }
                                    fallback={
                                      <span
                                        class={clsx(
                                          'text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
                                          (member.role === 'owner' ||
                                            member.role === 'admin') &&
                                            'bg-primary/15 text-primary',
                                          member.role === 'member' &&
                                            'bg-base-200 text-base-content/60'
                                        )}
                                      >
                                        {member.role === 'owner' ||
                                        member.role === 'admin'
                                          ? t('workspace_role_admin')
                                          : t('workspace_role_member')}
                                      </span>
                                    }
                                  >
                                    <WorkspaceRolePicker
                                      role={
                                        member.role === 'owner'
                                          ? 'admin'
                                          : (member.role as WorkspaceRole)
                                      }
                                      onChange={(r) =>
                                        handleChangeRole(member.user_id, r)
                                      }
                                      loading={
                                        promotingMember() === member.user_id
                                      }
                                    />
                                  </Show>
                                  {/* Remove / Leave */}
                                  <Show
                                    when={member.user_id !== user()?.id}
                                    fallback={
                                      <Show
                                        when={
                                          member.role === 'member' ||
                                          otherAdminsExist()
                                        }
                                      >
                                        <div
                                          class="tooltip tooltip-left"
                                          data-tip={t('leave_workspace')}
                                        >
                                          <button
                                            type="button"
                                            class="w-6 h-6 rounded-lg flex items-center justify-center text-base-content/20 hover:bg-warning/10 hover:text-warning transition-colors flex-shrink-0"
                                            onClick={() =>
                                              setConfirmLeave(true)
                                            }
                                          >
                                            <svg
                                              width="13"
                                              height="13"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              stroke-width="2"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                            >
                                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                              <polyline points="16 17 21 12 16 7" />
                                              <line
                                                x1="21"
                                                y1="12"
                                                x2="9"
                                                y2="12"
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      </Show>
                                    }
                                  >
                                    <Show when={isOwnerOrAdmin()}>
                                      <button
                                        class="w-7 h-7 rounded-lg flex items-center justify-center text-base-content/30 hover:bg-error/10 hover:text-error transition-all disabled:opacity-50"
                                        disabled={
                                          removingMember() === member.user_id
                                        }
                                        onClick={() =>
                                          setConfirmRemoveMember({
                                            userId: member.user_id,
                                            name: member.name || member.email,
                                          })
                                        }
                                      >
                                        <Show
                                          when={
                                            removingMember() !== member.user_id
                                          }
                                          fallback={
                                            <span class="loading loading-spinner loading-xs" />
                                          }
                                        >
                                          <i class="fa-solid fa-xmark text-xs" />
                                        </Show>
                                      </button>
                                    </Show>
                                  </Show>
                                </div>
                              )}
                            </For>
                            {/* Invited members inline */}
                            <Show when={isOwnerOrAdmin()}>
                              <For each={invitations()}>
                                {(inv) => (
                                  <div class="flex items-center gap-3 px-3.5 py-2.5 border-b border-base-200 last:border-b-0 hover:bg-base-200/50 transition-colors">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 bg-amber-100 text-amber-700">
                                      {getInitials(undefined, inv.email)}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                      <div class="text-[13px] font-semibold text-base-content truncate">
                                        {inv.email}
                                      </div>
                                    </div>
                                    <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap bg-amber-100 text-amber-700">
                                      {t('invited')}
                                    </span>
                                    <button
                                      class="w-7 h-7 rounded-lg flex items-center justify-center text-base-content/30 hover:bg-error/10 hover:text-error transition-all"
                                      onClick={() =>
                                        handleCancelInvitation(inv.id)
                                      }
                                    >
                                      <i class="fa-solid fa-xmark text-xs" />
                                    </button>
                                  </div>
                                )}
                              </For>
                            </Show>
                          </div>

                          {/* Inline invite form */}
                          <Show when={isOwnerOrAdmin()}>
                            <InviteForm onSubmit={inviteSubmit}>
                              <div class="flex gap-2 items-end">
                                <div class="flex-1">
                                  <InviteField
                                    name="email"
                                    validate={[
                                      required(t('please_enter_a_valid_email')),
                                      email(t('please_enter_a_valid_email')),
                                    ]}
                                  >
                                    {(field, fieldProps) => (
                                      <TextInput
                                        {...fieldProps}
                                        ref={(el: HTMLInputElement) => {
                                          inviteInputRef = el
                                          fieldProps.ref(el)
                                        }}
                                        type="email"
                                        value={field.value}
                                        error={field.error}
                                        placeholder={t('email_placeholder')}
                                        icon={
                                          <i class="fa-solid fa-envelope" />
                                        }
                                      />
                                    )}
                                  </InviteField>
                                </div>
                                <Button
                                  label={t('invite')}
                                  type="submit"
                                  color="primary"
                                  isLoading={inviteState.submitting}
                                />
                              </div>

                              <Show
                                when={inviteState.response.status === 'error'}
                              >
                                <Alert
                                  type="error"
                                  message={inviteState.response.message}
                                />
                              </Show>
                            </InviteForm>
                          </Show>
                        </>
                      )}
                    </Show>
                  </div>
                </Suspense>
              </Show>

              {/* ── Billing tab ── */}
              <Show when={tab() === 'billing'}>
                <Suspense fallback={<BillingTabSkeleton />}>
                  <BillingTabContent
                    workspaceId={props.workspaceId}
                    statusMessage={props.billingStatusMessage}
                  />
                </Suspense>
              </Show>
            </div>
          </div>

          <div class="modal-backdrop" onClick={() => props.onClose()} />
        </dialog>

        {/* Leave workspace confirmation modal */}
        <dialog
          class={clsx('modal z-[1100]', confirmLeave() ? 'modal-open' : '')}
        >
          <div class="modal-box max-w-sm">
            <h3 class="font-bold text-lg mb-2">{t('leave_workspace')}</h3>
            <p class="text-sm text-base-content/70 mb-4">
              {t('leave_workspace_confirmation')}
            </p>
            <Show when={leaveError()}>
              <div class="alert alert-error py-2 text-sm mb-3">
                {leaveError()}
              </div>
            </Show>
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-[10px] text-[13.5px] font-semibold text-base-content/60 border-[1.5px] border-base-200 hover:border-base-300 hover:bg-base-200/50 hover:text-base-content transition-all"
                onClick={() => {
                  setConfirmLeave(false)
                  setLeaveError(null)
                }}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                class="px-4 py-2 rounded-[10px] text-[13.5px] font-semibold bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center gap-1.5"
                disabled={leavingWorkspace()}
                onClick={handleLeaveWorkspace}
              >
                {leavingWorkspace() && (
                  <span class="loading loading-spinner loading-xs" />
                )}
                {t('leave_workspace')}
              </button>
            </div>
          </div>
          <div
            class="modal-backdrop"
            onClick={() => {
              setConfirmLeave(false)
              setLeaveError(null)
            }}
          />
        </dialog>

        {/* Remove member confirmation modal */}
        <dialog
          class={clsx(
            'modal z-[1100]',
            confirmRemoveMember() ? 'modal-open' : ''
          )}
        >
          <div class="modal-box max-w-sm">
            <h3 class="font-bold text-lg mb-2">{t('remove_member')}</h3>
            <p class="text-sm text-base-content/70 mb-4">
              {t('remove_member_confirmation').replace(
                '{name}',
                confirmRemoveMember()?.name ?? ''
              )}
            </p>
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-[10px] text-[13.5px] font-semibold text-base-content/60 border-[1.5px] border-base-200 hover:border-base-300 hover:bg-base-200/50 hover:text-base-content transition-all"
                onClick={() => setConfirmRemoveMember(null)}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                class="px-4 py-2 rounded-[10px] text-[13.5px] font-semibold bg-error text-white hover:bg-error/80 active:scale-[0.98] transition-all flex items-center gap-1.5"
                disabled={removingMember() !== null}
                onClick={async () => {
                  const member = confirmRemoveMember()
                  if (!member) return
                  setConfirmRemoveMember(null)
                  await handleRemoveMember(member.userId)
                }}
              >
                {removingMember() !== null && (
                  <span class="loading loading-spinner loading-xs" />
                )}
                {t('remove_member')}
              </button>
            </div>
          </div>
          <div
            class="modal-backdrop"
            onClick={() => setConfirmRemoveMember(null)}
          />
        </dialog>
      </Portal>

      <DeleteWorkspaceModal
        isOpen={confirmDelete()}
        workspaceName={
          workspace.latest?.name ?? workspaceListItem()?.name ?? ''
        }
        isDeleting={deletingWorkspace()}
        onConfirm={handleDeleteWorkspace}
        onCancel={() => {
          setConfirmDelete(false)
        }}
      />
    </>
  )
}

// --- Skeleton components ---

function GeneralTabSkeleton(): JSXElement {
  return (
    <div class="flex-1 px-5 md:px-7 py-4 md:py-5 space-y-5">
      <div>
        <div class="skeleton h-3.5 w-36 mb-2 rounded" />
        <div class="flex items-center gap-4 p-4 bg-base-200/50 border border-base-300 rounded-xl">
          <div class="skeleton w-14 h-14 rounded-2xl flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="skeleton h-2.5 w-24 rounded" />
            <div class="flex gap-2">
              <For each={[0, 1, 2, 3, 4, 5, 6]}>
                {() => <div class="skeleton w-[22px] h-[22px] rounded-full" />}
              </For>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="skeleton h-3.5 w-28 mb-2 rounded" />
        <div class="skeleton h-10 w-full rounded-lg" />
      </div>
      <div>
        <div class="skeleton h-3.5 w-32 mb-2 rounded" />
        <div class="skeleton h-[72px] w-full rounded-lg" />
      </div>
      <div>
        <div class="skeleton h-3.5 w-28 mb-2 rounded" />
        <div class="skeleton h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

function MembersListSkeleton(): JSXElement {
  return (
    <div class="flex-1 px-5 md:px-7 py-4 md:py-5">
      <div class="border border-base-300 rounded-xl overflow-hidden mb-3">
        <For each={[0, 1, 2, 3]}>
          {() => (
            <div class="flex items-center gap-3 px-3.5 py-2.5 border-b border-base-200 last:border-b-0">
              <div class="skeleton w-8 h-8 rounded-full flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="skeleton h-3.5 w-28 mb-1.5 rounded" />
                <div class="skeleton h-2.5 w-40 rounded" />
              </div>
              <div class="skeleton h-6 w-16 rounded-full" />
            </div>
          )}
        </For>
      </div>
      <div class="skeleton h-14 w-full rounded-xl" />
    </div>
  )
}

function BillingTabSkeleton(): JSXElement {
  return (
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="px-5 md:px-7 pt-4 border-b border-base-300 flex gap-6">
        <div class="skeleton h-4 w-20 rounded mb-2.5" />
        <div class="skeleton h-4 w-16 rounded mb-2.5" />
        <div class="skeleton h-4 w-24 rounded mb-2.5" />
      </div>
      <div class="flex-1 px-5 md:px-7 py-4 md:py-5 space-y-4">
        <div class="skeleton h-44 w-full rounded-xl" />
        <div class="grid grid-cols-3 gap-3">
          <div class="skeleton h-24 rounded-xl" />
          <div class="skeleton h-24 rounded-xl" />
          <div class="skeleton h-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// --- Helper components ---

function SettingsFooter(props: {
  hasChanges: boolean
  onCancel: () => void
  onSave?: () => void
  saveType?: 'submit' | 'button'
  isLoading?: boolean
  unsavedLabel: string
  cancelLabel: string
  saveLabel: string
}): JSXElement {
  return (
    <Show when={props.hasChanges}>
      <div class="px-5 md:px-7 py-3 md:py-3.5 border-t border-base-200 flex flex-wrap items-center justify-end gap-3">
        <span class="text-xs text-base-content/40 mr-auto">
          {props.unsavedLabel}
        </span>
        <button
          type="button"
          class="px-4 py-2 rounded-[10px] text-[13.5px] font-semibold text-base-content/60 border-[1.5px] border-base-200 hover:border-base-300 hover:bg-base-200/50 hover:text-base-content transition-all"
          onClick={() => props.onCancel()}
        >
          {props.cancelLabel}
        </button>
        <button
          type={props.saveType ?? 'button'}
          class="px-4 py-2 rounded-[10px] text-[13.5px] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center gap-1.5"
          disabled={props.isLoading}
          onClick={() => props.onSave?.()}
        >
          {props.isLoading && (
            <span class="loading loading-spinner loading-xs" />
          )}
          {props.saveLabel}
        </button>
      </div>
    </Show>
  )
}
