import { Accessor } from 'solid-js'

export function mustMatch(match: Accessor<string | undefined>) {
  return (error: string): ((value: string | undefined) => string) => {
    return (value: string | undefined) => {
      return value !== match() ? error : ''
    }
  }
}
