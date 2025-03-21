import { JSXElement } from 'solid-js'
import { A } from '@solidjs/router'

import puppy from '/puppy.jpg'
import { useLocale } from '../context/LocaleProvider'
import { TopBar } from '../components/TopBar'

export function NotFoundPage(): JSXElement {
  const { t } = useLocale()

  return (
    <>
      <TopBar />

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">
          {t('woops_this_page_does_not_exist')}
        </h1>
      </div>
      <div class="flex justify-center items-center mt-10">
        <h1 class="text-3xl text-center font-bold">
          {t('here_is_a_picture_of_a')}
          <span class="text-transparent bg-clip-text bg-linear-to-tr from-primary to-secondary">
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
