import { JSXElement } from 'solid-js'
import { A } from '@solidjs/router'

import puppy from '/puppy.jpg'
import { AuthCard } from '../components/AuthCard'
import { useLocale } from '../context/LocaleProvider'

export function NotFoundPage(): JSXElement {
  const { t } = useLocale()

  return (
    <AuthCard title={t('woops_this_page_does_not_exist')} subtitle="">
      <div class="flex flex-col items-center gap-4">
        <p class="text-sm text-base-content/60 text-center">
          {t('here_is_a_picture_of_a')}
          <span class="text-transparent bg-clip-text bg-linear-to-tr from-primary to-secondary">
            {t('puppy')}
          </span>
        </p>
        <figure>
          <img src={puppy} alt="Puppy" class="rounded-lg max-h-48 w-auto" />
        </figure>
        <A class="btn btn-primary btn-sm" href="/home">
          {t('back_to_home')}
        </A>
      </div>
    </AuthCard>
  )
}
