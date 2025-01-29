import { JSXElement } from 'solid-js'

import puppy from '/puppy.jpg'
import preikestolen from '/preikestolen.jpg'

import { TopBar } from '../components/TopBar'
import { useLocale } from '../context/LocaleProvider'

export function LandingPage(): JSXElement {
  const { t } = useLocale()

  return (
    <>
      <TopBar />
      <div class="flex justify-center mt-40">
        <h1 class="text-4xl font-bold">
          {t('this_is')}
          <span class="text-transparent bg-clip-text bg-gradient-to-tr from-primary to-secondary">
            {t('your')}
          </span>
          {t('web_application')}
        </h1>
      </div>
      <div class="flex justify-center mt-5">
        <h2>{t('build')}</h2>
      </div>

      <div class="flex justify-center mt-40">
        <div class="card bg-base-100 w-96 shadow-xl mx-5">
          <figure>
            <img src={puppy} alt="Puppy" />
          </figure>
          <div class="card-body">
            <h2 class="card-title">{t('a_puppy')}</h2>
            <p>{t('want_to_show_puppies')}</p>
            <div class="card-actions justify-end">
              <button class="btn btn-ghost">{t('you_can')}</button>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 w-96 shadow-xl mx-5">
          <figure>
            <img src={preikestolen} alt="Preikestolen" />
          </figure>
          <div class="card-body">
            <h2 class="card-title">{t('preikestolen')}</h2>
            <p>{t('want_to_show_rocks')}</p>
            <div class="card-actions justify-end">
              <button class="btn btn-ghost">
                {t('someone_might_like_it')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
