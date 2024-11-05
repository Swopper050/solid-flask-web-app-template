import {
  createContext,
  createSignal,
  onMount,
  useContext,
  Accessor,
  JSXElement,
} from 'solid-js'

import api from './api'
import { User } from './models/User'

interface UserContextAttributes {
  user: Accessor<User> | null
  setUser: (user: User | null) => void
  fetchUser: () => Promise<void>
  loading: Accessor<boolean>
}

const UserContext = createContext<UserContextAttributes | null>(null)

export const UserProvider = (props: { children: JSXElement }) => {
  const [user, setUser] = createSignal<User | null>(null)
  const [loading, setLoading] = createSignal(true)

  const fetchUser = async () => {
    api
      .get('/whoami')
      .then(async (response) => {
        if (response.status === 200) {
          setUser(new User(response.data))
        } else {
          setUser(null)
        }

        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
  }

  onMount(() => {
    fetchUser()
  })

  return (
    <UserContext.Provider
      value={{ user: user, setUser, loading: loading, fetchUser: fetchUser }}
    >
      {props.children}
    </UserContext.Provider>
  )
}

export const useUser = (): UserContextAttributes => {
  const userContext = useContext(UserContext)
  if (userContext === null) {
    throw new Error('useUser can only be used within a UserProvider')
  }

  return userContext
}
