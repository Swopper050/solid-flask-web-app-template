import { BaseModel, BaseModelAttributes } from './Base'

export interface UserAttributes extends BaseModelAttributes {
  id: number | null
  email: string
  name: string
  is_admin: boolean
  is_verified: boolean
  access_token: string | null
  two_factor_enabled: boolean
}

export class User extends BaseModel<UserAttributes> {
  apiUrl = '/user'
  declare attrs: UserAttributes

  constructor(attrs: UserAttributes) {
    super(attrs)
    this.attrs = attrs
  }

  get email(): string {
    return super.get('email')
  }

  set email(email: string) {
    super.set('email', email)
  }

  get name(): string {
    return super.get('name')
  }

  set name(name: string) {
    super.set('name', name)
  }

  get isAdmin(): boolean {
    return super.get('is_admin')
  }

  get accessToken(): string | null {
    return super.get('access_token')
  }

  get isVerified(): boolean {
    return super.get('is_verified')
  }

  get twoFactorEnabled(): boolean {
    return super.get('two_factor_enabled')
  }
}
