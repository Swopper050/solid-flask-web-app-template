import { JSXElement, Show } from 'solid-js'
import { A } from '@solidjs/router'

import puppy from '/puppy.jpg'
import ProfileMenu from '../components/ProfileMenu'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { LanguageSelector } from '../components/LanguageSelector'
import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'

export function NotFoundPage(): JSXElement {
  const { user } = useUser()
  const { t } = useLocale()

  return (
    <>
      <div class="navbar fixed bg-base-100 top-0 left-0">
        <div class="flex-1" />
        <ThemeSwitcher />
        <LanguageSelector />

        <Show when={user() !== null}>
          <ProfileMenu />
        </Show>
      </div>

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">
          {t('woops_this_page_does_not_exist')}
        </h1>
      </div>
      <div class="flex justify-center items-center mt-10">
        <h1 class="text-3xl text-center font-bold">
          {t('here_is_a_picture_of_a')}
          <span class="text-transparent bg-clip-text bg-gradient-to-tr from-primary to-secondary">
            {t('puppy')}
          </span>
        </h1>
      </div>

      <div class="flex justify-center mt-10">
        <figure>
          <img src={puppy} alt="Puppy" />
        </figure>
      </div>

      <div class="flex justify-center mt-10">
        <A class="btn btn-primary" href="/home">
          {t('back_to_home')}
        </A>
      </div>
    </>
  )
}
