import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  JSXElement,
  useContext,
} from 'solid-js'

import { getWorkspaces } from '../api'
import { WorkspaceListItemAttributes } from '../models/Workspace'
import type { FrozenReason } from '../models/Workspace'
import { useUser } from './UserProvider'

interface WorkspaceContextAttributes {
  workspaces: Accessor<WorkspaceListItemAttributes[]>
  currentWorkspace: Accessor<WorkspaceListItemAttributes | null>
  setCurrentWorkspace: (workspace: WorkspaceListItemAttributes) => void
  fetchWorkspaces: () => Promise<void>
  loading: Accessor<boolean>
  isFrozen: Accessor<boolean>
  frozenReason: Accessor<FrozenReason>
  frozenModalOpen: Accessor<boolean>
  openFrozenModal: () => void
  closeFrozenModal: () => void
}

const WorkspaceContext = createContext<WorkspaceContextAttributes | null>(null)

export const WorkspaceProvider = (props: { children: JSXElement }) => {
  const { user } = useUser()
  const [workspaces, setWorkspaces] = createSignal<
    WorkspaceListItemAttributes[]
  >([])
  const [currentWorkspace, setCurrentWorkspace] =
    createSignal<WorkspaceListItemAttributes | null>(null)
  const [loading, setLoading] = createSignal(false)
  const [frozenModalOpen, setFrozenModalOpen] = createSignal(false)

  const isFrozen = createMemo(() => currentWorkspace()?.is_frozen ?? false)
  const frozenReason = createMemo(
    () => currentWorkspace()?.frozen_reason ?? null
  )

  const fetchWorkspaces = async () => {
    setLoading(true)
    try {
      const list = await getWorkspaces()
      setWorkspaces(list)

      // A ?workspace_id= in the URL (e.g. from a billing redirect) wins over
      // the locally cached workspace so deep links always open in the right workspace.
      const urlId = new URLSearchParams(window.location.search).get(
        'workspace_id'
      )
      const fromUrl = urlId ? list.find((w) => w.id === parseInt(urlId)) : null

      const savedId = localStorage.getItem('currentWorkspaceId')
      const saved = savedId
        ? list.find((w) => w.id === parseInt(savedId))
        : null

      const selected = fromUrl ?? saved ?? list[0] ?? null
      setCurrentWorkspace(selected)
      if (fromUrl) {
        localStorage.setItem('currentWorkspaceId', String(fromUrl.id))
        const url = new URL(window.location.href)
        url.searchParams.delete('workspace_id')
        window.history.replaceState({}, '', url.toString())
      }
    } catch {
      // silently fail — user may not be logged in yet
    } finally {
      setLoading(false)
    }
  }

  const switchWorkspace = (workspace: WorkspaceListItemAttributes) => {
    setCurrentWorkspace(workspace)
    localStorage.setItem('currentWorkspaceId', String(workspace.id))
  }

  // Keep workspaces in sync with the authenticated user so any entry point
  // (login, page refresh, deep link) ends up with a populated dropdown and
  // a selected workspace without each page having to fetch on its own.
  createEffect(() => {
    if (user()) {
      void fetchWorkspaces()
    } else {
      setWorkspaces([])
      setCurrentWorkspace(null)
    }
  })

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspace: switchWorkspace,
        fetchWorkspaces,
        loading,
        isFrozen,
        frozenReason,
        frozenModalOpen,
        openFrozenModal: () => setFrozenModalOpen(true),
        closeFrozenModal: () => setFrozenModalOpen(false),
      }}
    >
      {props.children}
    </WorkspaceContext.Provider>
  )
}

export const useWorkspace = (): WorkspaceContextAttributes => {
  const ctx = useContext(WorkspaceContext)
  if (ctx === null) {
    throw new Error('useWorkspace can only be used within a WorkspaceProvider')
  }
  return ctx
}
