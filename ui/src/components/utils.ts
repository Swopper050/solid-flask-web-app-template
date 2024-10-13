export function isGoodPassword(password: string): boolean {
  return (
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    password.length > 8
  )
}

export function passwordConditions(): string {
  return `Password must contain:\n
 - 8 or more characters\n
 - at least 1 uppercase letter\n
 - at least 1 lowercase letter\n
 - 1 digit`
}
