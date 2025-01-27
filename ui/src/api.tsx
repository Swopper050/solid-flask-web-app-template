import axios from 'axios'

const api = axios.create({ baseURL: '/api', withCredentials: true })
api.defaults.headers.post['Content-Type'] = 'application/json'

export default api

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  return post('api/change_password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
}

export async function passwordLogin(
  email: string,
  password: string
) {
  return post('api/login', {
    email: email,
    password: password,
  })
}

export async function totpLogin(
  email: string,
  totpCode: string
) {
  return post('api/login_2fa', {
    email: email,
    totp_code: totpCode,
  })
}

export async function post(url: string, data: object) {
  return fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      ...data,
    }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
}
