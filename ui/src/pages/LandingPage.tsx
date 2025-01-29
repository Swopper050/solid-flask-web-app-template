import { JSXElement, Show, createSignal } from 'solid-js'
import { A } from '@solidjs/router'

import puppy from '/puppy.jpg'
import preikestolen from '/preikestolen.jpg'

import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { LanguageSelector } from '../components/LanguageSelector'
import { LoginModal } from '../components/LoginModal'
import { RegisterModal } from '../components/RegisterModal'
import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'

export function LandingPage(): JSXElement {
  const { t } = useLocale()
  const { user } = useUser()
  const [openLoginModal, setOpenLoginModal] = createSignal(false)
  const [openRegisterModal, setOpenRegisterModal] = createSignal(false)

  return (
    <>
      <div class="navbar fixed bg-base-100 top-0 left-0">
        <div class="flex-1">
          <A class="btn btn-ghost text-xl" href="">
            My solid app
          </A>
        </div>

        <ThemeSwitcher />

        <LanguageSelector />

        <Show
          when={user() === null}
          fallback={
            <div class="flex-none ml-2">
              <A class="btn btn-ghost" href="/home">
                <i class="fa-solid fa-arrow-right-to-bracket" />
                {t('to_the_app')}
              </A>
            </div>
          }
        >
          <div class="flex-none mx-1">
            <button
              class="btn btn-ghost"
              onClick={() => setOpenLoginModal(true)}
            >
              {t('login')}
            </button>
          </div>

          <div class="flex-none mx-1">
            <button
              class="btn btn-ghost"
              onClick={() => setOpenRegisterModal(true)}
            >
              {t('register')}
            </button>
          </div>
        </Show>
      </div>

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

      <div class="flex justify-center my-40">
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

      <LoginModal
        isOpen={openLoginModal()}
        onClose={() => setOpenLoginModal(false)}
      />

      <RegisterModal
        isOpen={openRegisterModal()}
        onClose={() => setOpenRegisterModal(false)}
      />
    </>
  )
}
