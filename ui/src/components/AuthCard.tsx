import type { ParentProps, JSXElement } from 'solid-js'

import { ThemeSwitcher } from './ThemeSwitcher'
import { LanguageSelector } from './LanguageSelector'

interface AuthCardProps extends ParentProps {
  title: string
  subtitle: string
}

export function AuthCard(props: AuthCardProps): JSXElement {
  return (
    <div class="min-h-screen bg-base-200 flex items-center justify-center p-4 relative">
      <div class="absolute top-4 right-4 flex items-center gap-1">
        <ThemeSwitcher />
        <LanguageSelector />
      </div>

      <div class="bg-base-100 border border-base-300 rounded-xl p-10 w-full max-w-sm shadow-sm">
        <div class="text-center text-xl font-medium tracking-tight mb-7">
          My solid app<span class="text-primary">.</span>
        </div>

        <h1 class="text-base font-medium text-base-content mb-1">
          {props.title}
        </h1>
        <p class="text-sm text-base-content/60 mb-6">{props.subtitle}</p>

        {props.children}
      </div>
    </div>
  )
}
