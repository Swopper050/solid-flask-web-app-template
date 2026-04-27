import { BaseModel, BaseModelAttributes } from './Base'

export interface WorkspaceMemberAttributes {
  id: number
  workspace_id: number
  user_id: number
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  email: string
  name: string
}

export type WorkspaceLanguage = 'nl' | 'en'

export const WORKSPACE_LANGUAGES: WorkspaceLanguage[] = ['nl', 'en']

export interface WorkspaceAttributes extends BaseModelAttributes {
  id: number
  name: string
  color: string | null
  context: string | null
  language: WorkspaceLanguage
  setup_completed: boolean
  created_by: number
  created_at: string
  members: WorkspaceMemberAttributes[]
}

export type FrozenReason = 'trial_expired' | 'subscription_expired' | null

export interface WorkspaceListItemAttributes {
  id: number
  name: string
  color: string | null
  setup_completed: boolean
  role: 'owner' | 'admin' | 'member'
  member_count: number
  is_frozen: boolean
  frozen_reason: FrozenReason
}

export interface WorkspaceInvitationAttributes {
  id: number
  workspace_id: number
  email: string
  invited_by: number
  created_at: string
  accepted: boolean
}

export class Workspace extends BaseModel<WorkspaceAttributes> {
  apiUrl = '/workspaces'
  declare attrs: WorkspaceAttributes

  constructor(attrs: WorkspaceAttributes) {
    super(attrs)
    this.attrs = attrs
  }

  get name(): string {
    return super.get('name')
  }

  get members(): WorkspaceMemberAttributes[] {
    return super.get('members') ?? []
  }

  get createdBy(): number {
    return super.get('created_by')
  }
}
