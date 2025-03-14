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

      <div class="flex justify-center mt-20 md:mt-40 px-4 pt-4">
        <h1 class="text-2xl md:text-4xl font-bold text-center">
          {t('this_is')}
          <span class="text-transparent bg-clip-text bg-linear-to-tr from-primary to-secondary">
            {t('your')}
          </span>
          {t('web_application')}
        </h1>
      </div>
      <div class="flex justify-center mt-3 md:mt-5 px-4">
        <h2 class="text-center">{t('build')}</h2>
      </div>

      <div class="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 mt-10 md:mt-24 px-4 pb-10">
        <div class="card bg-base-100 w-full max-w-xs sm:max-w-sm md:w-96 shadow-xl">
          <figure>
            <img src={puppy} alt="Puppy" class="w-full h-auto" />
          </figure>
          <div class="card-body">
            <h2 class="card-title">{t('a_puppy')}</h2>
            <p>{t('want_to_show_puppies')}</p>
            <div class="card-actions justify-end">
              <button class="btn btn-ghost">{t('you_can')}</button>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 w-full max-w-xs sm:max-w-sm md:w-96 shadow-xl">
          <figure>
            <img src={preikestolen} alt="Preikestolen" class="w-full h-auto" />
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
