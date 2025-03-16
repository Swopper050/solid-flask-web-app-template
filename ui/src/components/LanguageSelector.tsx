import { createEffect, JSXElement, For } from 'solid-js'

import { useLocale, locales } from '../context/LocaleProvider'

export function LanguageSelector(): JSXElement {
  const { locale, setLocale } = useLocale()

  let detailsRef: HTMLDetailsElement | undefined

  createEffect(() => {
    localStorage.setItem('locale', locale())
  })

  return (
    <details ref={detailsRef} class="dropdown dropdown-end">
      <summary class="btn btn-sm btn-ghost">
        <div class="flex gap-2">
          <CountryFlag countryCode={locale()} />
        </div>
      </summary>

      <ul class="menu dropdown-content bg-base-100 rounded-box shadow-sm z-100">
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
                <div class="flex gap-2 mr-2">
                  <CountryFlag countryCode={language} />
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

interface CountryFlagProps {
  countryCode: string
  width?: number
}

function resolveCountryCode(code: string): string {
  return code.toUpperCase() === 'EN' ? 'GB' : code.toUpperCase()
}

function CountryFlag(props: CountryFlagProps): JSXElement {
  return (
    <img
      width={`${props.width || 15}px`}
      alt={resolveCountryCode(props.countryCode)}
      src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${resolveCountryCode(props.countryCode)}.svg`}
    />
  )
}
