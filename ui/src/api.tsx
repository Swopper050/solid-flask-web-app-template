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
