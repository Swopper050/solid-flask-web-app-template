import { JSXElement } from 'solid-js'
import { A } from '@solidjs/router'

import { ProfileMenu } from '../components/ProfileMenu'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { LanguageSelector } from '../components/LanguageSelector'

import { useLocale } from '../context/LocaleProvider'

interface BasePageProps {
  mainComponent: () => JSXElement
}

export function BasePage(props: BasePageProps): JSXElement {
  const { t } = useLocale()

  return (
    <div class="drawer drawer-open">
      <input id="main-sidebar" type="checkbox" class="drawer-toggle" />
      <div class="flex flex-col drawer-side bg-base-200">
        <A class="btn btn-ghost text-xl flex-1 m-2" href="/">
          {t('my_solid_app')}
        </A>
        <ul class="menu text-base-content flex-1 w-56">
          <li class="mb-1 font-bold">
            <A href="/home">{t('home')}</A>
          </li>
        </ul>
      </div>

      <div class="drawer-content flex flex-col m-0 p-0">
        <div class="navbar bg-base-100">
          <div class="flex-1" />
          <div class="flex-none">
            <ThemeSwitcher />
            <LanguageSelector />
          </div>
          <div class="flex-none">
            <ProfileMenu />
          </div>
        </div>

        <main>{props.mainComponent()}</main>
      </div>
    </div>
  )
}
