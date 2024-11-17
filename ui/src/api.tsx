import axios from 'axios'
import { User } from './models/User'
import { Setter } from 'solid-js'

const api = axios.create({ baseURL: '/api', withCredentials: true })
api.defaults.headers.post['Content-Type'] = 'application/json'

export default api

export type PostResponse = {
  success?: boolean
  loading?: boolean
  message?: string
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  setResponse: Setter<PostResponse>,
  setUser: (user: User | null) => void
) {
  setResponse({
    loading: true,
  })

  const response = await fetch('/api/change_password', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })

  if (response.status != 200) {
    setResponse({
      success: false,
      loading: false,
      message: 'Failed to update password',
    })

    return
  }

  const data = await response.json()

  setUser(new User(data))

  setResponse({
    success: true,
    loading: false,
    message: 'Successfully updated password',
  })
}
