import {
  Show,
  Suspense,
  createContext,
  createSignal,
  createResource,
  useContext,
  JSXElement,
} from 'solid-js'

import * as i18n from '@solid-primitives/i18n'

import type * as en from '../locales/en'
import { dict as defaultDict } from '../locales/en'

export const locales = ['en', 'nl'] as const
export type Locale = (typeof locales)[number]
export type TranslationKeys = typeof en.dict
export type Translations = i18n.Flatten<TranslationKeys>

export async function fetchDictionary(locale: Locale): Promise<Translations> {
  const dict: Translations = (await import(`../locales/${locale}.ts`)).dict
  return i18n.flatten(dict) // flatten the dictionary to make all nested keys available top-level
}

type LocaleContextType = {
  locale: () => Locale
  setLocale: (newLocale: Locale) => void
  translations: () => Translations
  t: i18n.Translator<Translations>
}

const LocaleContext = createContext<LocaleContextType>()

export function LocaleProvider(props: { children: JSXElement }) {
  const [locale, setLocale] = createSignal<Locale>(
    (localStorage.getItem('locale') as Locale) ?? 'en'
  )

  const [translations, { mutate }] = createResource(locale, async (locale) => {
    if (locale === 'en') return defaultDict
    return await fetchDictionary(locale)
  })

  const t = i18n.translator(() => translations() ?? {})

  const updateLocale = async (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)

    if (newLocale !== 'en') {
      mutate(defaultDict)
    }
  }

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale: updateLocale, translations, t }}
    >
      <Suspense
        fallback={
          <div class="fixed inset-0 flex flex-col items-center justify-center">
            <span class="loading loading-ball loading-lg" />
            <p class="mt-4 text-lg">Loading translations...</p>
          </div>
        }
      >
        <Show when={translations()}>{props.children}</Show>
      </Suspense>
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context)
    throw new Error('useLocale must be used within an LocaleProvider')
  return context
}
