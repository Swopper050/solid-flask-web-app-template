import { createSignal, Show, JSXElement } from 'solid-js';
import { A } from '@solidjs/router'

import { useUser } from '../context/UserProvider';
import { useLocale } from '../context/LocaleProvider';

import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { LanguageSelector } from '../components/LanguageSelector'
import { LoginModal } from '../components/LoginModal'
import { RegisterModal } from '../components/RegisterModal'

export function TopBar(): JSXElement {
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
