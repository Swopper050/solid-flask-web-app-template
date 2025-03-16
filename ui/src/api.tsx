import { PaginationResult } from './models/Base'
import { UserAttributes } from './models/User'
import { TranslationKeys } from './context/LocaleProvider'

interface ErrorData {
  error: number
  message: string
}

export async function getErrorMessage(
  response: Response
): Promise<keyof TranslationKeys> {
  const errorData: ErrorData = await response.json()
  return errorMessages[errorData.error] || 'an_unknown_error_occurred'
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  return post('api/change_password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
}

export async function forgotPassword(email: string) {
  return post('api/forgot_password', {
    email: email,
  })
}

export async function getUsers(
  page: number,
  perPage: number
): Promise<PaginationResult<UserAttributes>> {
  const response = await get(`api/users?page=${page}&per_page=${perPage}`)
  return response.json()
}

export async function resetPassword(
  email: string,
  resetToken: string,
  newPassword: string
) {
  return post('api/reset_password', {
    email: email,
    reset_token: resetToken,
    new_password: newPassword,
  })
}

export async function passwordLogin(email: string, password: string) {
  return post('api/login', {
    email: email,
    password: password,
  })
}

export async function totpLogin(email: string, totpCode: string) {
  return post('api/login_2fa', {
    email: email,
    totp_code: totpCode,
  })
}

export async function logout() {
  return post('api/logout', {})
}

export async function deleteAccount() {
  return _delete('api/delete_account')
}

export async function register(email: string, password: string) {
  return post('api/register', {
    email: email,
    password: password,
  })
}

export async function generate2FASecret() {
  return get('api/generate_2fa_secret')
}

export async function enable2FA(totpSecret: string, totpCode: string) {
  return post('api/enable_2fa', {
    totp_secret: totpSecret,
    totp_code: totpCode,
  })
}

export async function disable2FA(totpCode: string) {
  return post('api/disable_2fa', {
    totp_code: totpCode,
  })
}

export async function verifyEmail(email: string, verificationToken: string) {
  return post('api/verify_email', {
    email: email,
    verification_token: verificationToken,
  })
}

export async function resendVerificationMail() {
  return post('api/resend_email_verification', {})
}

export async function whoAmI() {
  return get('api/whoami')
}

export async function createUser(
  email: string,
  password: string,
  isAdmin: boolean
) {
  return post(`api/users`, {
    email: email,
    password: password,
    is_admin: isAdmin,
  })
}

export async function deleteUser(userId: number) {
  return _delete(`api/user/${userId}`)
}

export async function get(url: string) {
  return fetch(url, {
    method: 'GET',
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
}

export async function post(url: string, data: object) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      ...data,
    }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
}

export async function _delete(url: string) {
  return fetch(url, {
    method: 'DELETE',
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
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
}
