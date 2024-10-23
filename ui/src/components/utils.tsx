import { JSXElement } from 'solid-js'

export function isGoodPassword(password: string): boolean {
  return (
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    password.length > 8
  )
}

export function passwordConditions(): JSXElement {
  return (
    <>
      <p>Password must contain:</p>
      <ul>
        <li>- 8 or more characters</li>
        <li>- at least 1 uppercase letter</li>
        <li>- at least 1 lowercase letter</li>
        <li>- 1 digit</li>
      </ul>
    </>
  )
}
