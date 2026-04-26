import { TranslationKey, TranslationKeys } from './context/LocaleProvider'
import { PaginationResult } from './models/Base'
import { UserAttributes } from './models/User'
import {
  WorkspaceAttributes,
  WorkspaceInvitationAttributes,
  WorkspaceListItemAttributes,
} from './models/Workspace'
import {
  BillingStatusAttributes,
  PaginatedInvoices,
  PaymentMethodAttributes,
} from './models/Billing'

export interface ErrorData {
  error: number
  message: string
}

export function getErrorMessage(response: ErrorData): TranslationKey {
  return errorMessages[response.error] || 'an_unknown_error_occurred'
}

export type ChangePasswordData = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export async function changePassword(data: ChangePasswordData) {
  return post('/api/change_password', {
    current_password: data.currentPassword,
    new_password: data.newPassword,
  })
}

export type ForgotPasswordData = {
  email: string
}

export async function forgotPassword(data: ForgotPasswordData) {
  return post('/api/forgot_password', {
    email: data.email,
  })
}

export async function getUsers(
  page: number,
  perPage: number
): Promise<PaginationResult<UserAttributes>> {
  return await get(`/api/users?page=${page}&per_page=${perPage}`).then(
    (response) => response.json()
  )
}

export type ResetPasswordData = {
  email: string
  resetToken: string
  newPassword: string
  checkPassword: string
}

export async function resetPassword(data: ResetPasswordData) {
  return post('/api/reset_password', {
    email: data.email,
    reset_token: data.resetToken,
    new_password: data.newPassword,
  })
}

export type PasswordLoginData = {
  email: string
  password: string
}

export async function passwordLogin(data: PasswordLoginData) {
  return post('/api/login', {
    email: data.email,
    password: data.password,
  })
}

export type TotpLoginData = {
  totpCode: string
  email: string
}

export async function totpLogin(data: TotpLoginData) {
  return post('/api/login_2fa', {
    email: data.email,
    totp_code: data.totpCode,
  })
}

export async function logout() {
  return post('/api/logout', {})
}

export async function deleteAccount() {
  return _delete('/api/delete_account')
}

export type RegisterUserData = {
  name: string
  email: string
  password: string
  checkPassword: string
  invitationToken?: string
}

export async function register(data: RegisterUserData) {
  return post('/api/register', {
    name: data.name,
    email: data.email,
    password: data.password,
    ...(data.invitationToken && { invitation_token: data.invitationToken }),
  })
}

export async function generate2FASecret() {
  return get('/api/generate_2fa_secret')
}

export type Enable2FAData = {
  totpSecret: string
  totpCode: string
}

export async function enable2FA(data: Enable2FAData) {
  return post('/api/enable_2fa', {
    totp_secret: data.totpSecret,
    totp_code: data.totpCode,
  })
}

export type Disable2FAData = {
  totpCode: string
}

export async function disable2FA(data: Disable2FAData) {
  return post('/api/disable_2fa', {
    totp_code: data.totpCode,
  })
}

export async function verifyEmail(email: string, verificationToken: string) {
  return post('/api/verify_email', {
    email: email,
    verification_token: verificationToken,
  })
}

export async function resendVerificationMail() {
  return post('/api/resend_email_verification', {})
}

export async function whoAmI() {
  return get('/api/whoami')
}

export type CreateUserData = {
  email: string
  password: string
  isAdmin: boolean
}

export async function createUser(data: CreateUserData) {
  return post(`/api/users`, {
    email: data.email,
    password: data.password,
    is_admin: data.isAdmin,
  })
}

export type DeleteUserData = {
  userID: number
}

export async function deleteUser(data: DeleteUserData) {
  return _delete(`/api/user/${data.userID}`)
}

// Workspaces

export async function getWorkspaces(): Promise<WorkspaceListItemAttributes[]> {
  return get('/api/workspaces').then((r) => r.json())
}

export type CreateWorkspaceData = { name: string }

export async function createWorkspace(data: CreateWorkspaceData) {
  return post('/api/workspaces', { name: data.name })
}

export async function getWorkspace(id: number): Promise<WorkspaceAttributes> {
  return get(`/api/workspaces/${id}`).then((r) => r.json())
}

export async function updateWorkspace(
  id: number,
  data: {
    name?: string
    color?: string | null
    context?: string | null
    language?: string
  }
) {
  return put(`/api/workspaces/${id}`, data)
}

export async function deleteWorkspace(id: number) {
  return _delete(`/api/workspaces/${id}`)
}

export async function inviteMember(workspaceId: number, email: string) {
  return post(`/api/workspaces/${workspaceId}/invitations`, { email })
}

export async function getInvitations(
  workspaceId: number
): Promise<WorkspaceInvitationAttributes[]> {
  return get(`/api/workspaces/${workspaceId}/invitations`).then((r) => r.json())
}

export async function cancelInvitation(
  workspaceId: number,
  invitationId: number
) {
  return _delete(`/api/workspaces/${workspaceId}/invitations/${invitationId}`)
}

export async function removeMember(workspaceId: number, userId: number) {
  return _delete(`/api/workspaces/${workspaceId}/members/${userId}`)
}

export async function updateMemberRole(
  workspaceId: number,
  userId: number,
  role: string
) {
  return patch(`/api/workspaces/${workspaceId}/members/${userId}`, { role })
}

export async function acceptInvitation(token: string) {
  return post('/api/invitations/accept', { token })
}

export interface InvitationLookupResult {
  email: string
  workspace_name: string
}

export async function lookupInvitation(
  token: string
): Promise<InvitationLookupResult | null> {
  const r = await post('/api/invitations/lookup', { token })
  if (!r.ok) return null
  return r.json()
}

// Billing

export async function getBillingStatus(
  workspaceId: number
): Promise<BillingStatusAttributes> {
  return get(`/api/workspaces/${workspaceId}/billing`).then((r) => r.json())
}

export async function startBillingCheckout(
  workspaceId: number
): Promise<{ checkout_url: string }> {
  const r = await post(`/api/workspaces/${workspaceId}/billing/checkout`, {})
  const data = await r.json()
  if (!r.ok) throw data
  return data
}

export async function updatePaymentMethod(
  workspaceId: number
): Promise<{ checkout_url: string }> {
  const r = await post(
    `/api/workspaces/${workspaceId}/billing/update-payment-method`,
    {}
  )
  const data = await r.json()
  if (!r.ok) throw data
  return data
}

export async function updateBillingSeats(
  workspaceId: number,
  seats: number
): Promise<BillingStatusAttributes> {
  const r = await patch(`/api/workspaces/${workspaceId}/billing/seats`, {
    seats,
  })
  const data = await r.json()
  if (!r.ok) throw data
  return data
}

export async function cancelCheckout(workspaceId: number) {
  const r = await _delete(`/api/workspaces/${workspaceId}/billing/checkout`)
  const data = await r.json()
  if (!r.ok) throw data
  return data
}

export async function cancelSubscription(workspaceId: number) {
  return _delete(`/api/workspaces/${workspaceId}/billing/subscription`)
}

export async function getInvoices(
  workspaceId: number,
  limit = 5,
  offset = 0
): Promise<PaginatedInvoices> {
  return get(
    `/api/workspaces/${workspaceId}/billing/invoices?limit=${limit}&offset=${offset}`
  ).then((r) => r.json())
}

export async function getPaymentMethod(
  workspaceId: number
): Promise<PaymentMethodAttributes> {
  return get(`/api/workspaces/${workspaceId}/billing/payment-method`).then(
    (r) => r.json()
  )
}

export function getInvoiceDownloadUrl(
  workspaceId: number,
  invoiceId: number
): string {
  return resolveUrl(
    `/api/workspaces/${workspaceId}/billing/invoices/${invoiceId}/download`
  )
}

// HTTP helpers

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export function resolveUrl(url: string): string {
  if (API_BASE) {
    return API_BASE + url.replace(/^\/api/, '')
  }
  return url
}

async function checkFrozenResponse(response: Response): Promise<Response> {
  if (response.status === 403) {
    try {
      const cloned = response.clone()
      const json = await cloned.json()
      handleFrozenError(json)
    } catch {
      // ignore parse errors
    }
  }
  return response
}

export async function get(url: string) {
  return fetch(resolveUrl(url), {
    method: 'GET',
    credentials: 'include',
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
}

export async function post(url: string, data: object) {
  const response = await fetch(resolveUrl(url), {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ ...data }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
  return checkFrozenResponse(response)
}

export async function put(url: string, data: object) {
  const response = await fetch(resolveUrl(url), {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify({ ...data }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
  return checkFrozenResponse(response)
}

export async function patch(url: string, data: object) {
  const response = await fetch(resolveUrl(url), {
    method: 'PATCH',
    credentials: 'include',
    body: JSON.stringify({ ...data }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
  return checkFrozenResponse(response)
}

export async function _delete(url: string) {
  const response = await fetch(resolveUrl(url), {
    method: 'DELETE',
    credentials: 'include',
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
  return checkFrozenResponse(response)
}

const errorMessages: Record<number, keyof TranslationKeys> = {
  0: 'an_account_with_this_email_already_exists',
  1: 'could_not_login_with_the_given_email_and_password',
  2: 'incorrect_2fa_code_try_again',
  3: 'wrong_password',
  4: 'new_password_does_not_match_conditions',
  5: 'could_not_reset_password_with_the_given_token',
  6: 'this_token_has_expired',
  7: 'could_not_verify_email_with_the_given_token',
  8: 'this_requires_you_to_be_an_admin',
  9: 'twofa_is_already_enabled',
  10: 'incorrect_2fa_code_try_again',
  11: 'twofa_is_already_disabled',
  12: 'user_not_found',
  13: 'an_unknown_error_occurred',
  14: 'workspace_not_found',
  15: 'not_a_workspace_member',
  16: 'not_workspace_owner_or_admin',
  17: 'already_a_workspace_member',
  18: 'invitation_not_found',
  19: 'cannot_remove_workspace_owner',
  26: 'subscription_not_found',
  27: 'billing_error',
  28: 'invoice_not_found',
  29: 'seat_limit_reached',
  30: 'cannot_leave_last_owner',
  33: 'workspace_frozen',
  35: 'upgrade_disabled',
}

const WORKSPACE_FROZEN_ERROR = 33

export function dispatchFrozenEvent(): void {
  window.dispatchEvent(new CustomEvent('workspace-frozen'))
}

export function handleFrozenError(errorData: ErrorData): boolean {
  if (errorData.error === WORKSPACE_FROZEN_ERROR) {
    dispatchFrozenEvent()
    return true
  }
  return false
}
