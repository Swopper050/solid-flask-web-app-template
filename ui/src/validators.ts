import { Accessor } from 'solid-js'
import { minLength, pattern } from '@modular-forms/solid'

import type { TranslationKey } from './context/LocaleProvider'

export function mustMatch(match: Accessor<string | undefined>) {
  return (error: string): ((value: string | undefined) => string) => {
    return (value: string | undefined) => {
      return value !== match() ? error : ''
    }
  }
}

type Translator = (key: TranslationKey) => string

/**
 * Validators that enforce the application's password strength rules
 * (length, uppercase, lowercase, digit, special character).
 *
 * Pass `{ requireSpecialChar: false }` to opt out of the special-character rule.
 */
export function passwordRules(
  t: Translator,
  options: { requireSpecialChar?: boolean } = {}
) {
  const rules = [
    minLength(8, t('your_password_must_have_8_characters_or_more')),
    pattern(/[A-Z]/, t('your_password_must_have_1_uppercase_letter')),
    pattern(/[a-z]/, t('your_password_must_have_1_lowercase_letter')),
    pattern(/[0-9]/, t('your_password_must_have_1_digit')),
  ]
  if (options.requireSpecialChar !== false) {
    rules.push(
      pattern(/[\W]/, t('your_password_must_have_1_special_character'))
    )
  }
  return rules
}
