import { createEffect, JSXElement, For } from 'solid-js'

import { useI18n, locales } from '../context/I18nProvider'

export function LanguageSelector(): JSXElement {
  const { locale, setLocale } = useI18n()

  let detailsRef: HTMLDetailsElement | undefined

  createEffect(() => {
    localStorage.setItem('locale', locale())
  })

  return (
    <details ref={detailsRef} class="dropdown">
      <summary class="btn btn-sm btn-ghost">
        {countryCodeToFlag(locale())}
      </summary>

      <ul class="menu dropdown-content bg-base-100 rounded-box shadow">
        <For each={locales}>
          {(language) => (
            <li>
              <button
                class="btn btn-ghost"
                onClick={() => {
                  setLocale(language)
                  detailsRef?.removeAttribute('open')
                }}
              >
                <div class="flex items-center gap-2">
                  <span>{countryCodeToFlag(language)}</span>
                  <span>{language}</span>
                </div>
              </button>
            </li>
          )}
        </For>
      </ul>
    </details>
  )
}

function countryCodeToFlag(countryCode: string): string {
  if (countryCode === 'en') {
    countryCode = 'gb'
  }

  // Convert the country code to uppercase to match the regional indicator symbols
  const code = countryCode.toUpperCase()

  // Calculate the offset for the regional indicator symbols
  const offset = 127397

  // Convert each letter in the country code to its corresponding regional indicator symbol
  const flag = Array.from(code)
    .map((letter) => String.fromCodePoint(letter.charCodeAt(0) + offset))
    .join('')

  return flag
}
