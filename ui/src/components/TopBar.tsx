import { createSignal, Show, JSXElement } from 'solid-js'
import { A } from '@solidjs/router'
import { clsx } from 'clsx'

import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'

import { Button, IconButton } from '../components/Button'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { LanguageSelector } from '../components/LanguageSelector'
import { LoginModal } from '../components/LoginModal'
import { RegisterModal } from '../components/RegisterModal'

export function TopBar(): JSXElement {
  const { t } = useLocale()
  const { user } = useUser()

  const [openLoginModal, setOpenLoginModal] = createSignal(false)
  const [openRegisterModal, setOpenRegisterModal] = createSignal(false)
  const [sidebarOpen, setSidebarOpen] = createSignal(false)

  return (
    <>
      <div class="navbar fixed bg-base-100 top-0 left-0 z-20">
        <div class="flex-none md:hidden">
          <IconButton
            icon="fa-solid fa-bars"
            shape="square"
            size="md"
            onClick={() => setSidebarOpen(!sidebarOpen())}
          />
        </div>

        <div class="flex-1 text-center md:text-left">
          <A class="btn btn-ghost text-xl" href="">
            My solid app
          </A>
        </div>

        <div class="flex items-center gap-1">
          <ThemeSwitcher />
          <LanguageSelector />
        </div>

        <div class="hidden md:flex md:items-center md:gap-1 md:ml-2">
          <Show
            when={user() === null}
            fallback={
              <A class="btn btn-ghost" href="/home">
                <i class="fa-solid fa-arrow-right-to-bracket mr-1" />
                {t('to_the_app')}
              </A>
            }
          >
            <Button
              variant="ghost"
              onClick={() => setOpenLoginModal(true)}
              dataCy="open-login-modal"
              label={t('login')}
            />

            <Button
              variant="ghost"
              onClick={() => setOpenRegisterModal(true)}
              dataCy="open-register-modal"
              label={t('register')}
            />
          </Show>
        </div>
      </div>

      <div
        class={clsx(
          'fixed inset-y-0 left-0 transform',
          sidebarOpen() ? 'translate-x-0' : '-translate-x-full',
          'transition-transform duration-300 ease-in-out w-64 bg-base-100 z-30 md:hidden'
        )}
      >
        <div class="flex flex-col h-full p-4">
          <div class="flex justify-between items-center mb-6">
            <A class="text-xl font-bold" href="">
              My solid app
            </A>
            <IconButton
              icon="fa-solid fa-xmark"
              shape="square"
              size="md"
              onClick={() => setSidebarOpen(false)}
            />
          </div>

          <div class="flex flex-col">
            <Show
              when={user() === null}
              fallback={
                <A
                  class="btn btn-primary w-full justify-start mb-4"
                  href="/home"
                >
                  <i class="fa-solid fa-arrow-right-to-bracket mr-2" />
                  {t('to_the_app')}
                </A>
              }
            >
              <div class="space-y-2 mb-6">
                <Button
                  variant="ghost"
                  block
                  class="justify-start"
                  icon="fa-solid fa-sign-in-alt mr-2"
                  onClick={() => {
                    setOpenLoginModal(true)
                    setSidebarOpen(false)
                  }}
                  dataCy="open-login-modal-mobile"
                  label={t('login')}
                />

                <Button
                  variant="ghost"
                  block
                  class="justify-start"
                  icon="fa-solid fa-user-plus mr-2"
                  onClick={() => {
                    setOpenRegisterModal(true)
                    setSidebarOpen(false)
                  }}
                  dataCy="open-login-modal-mobile"
                  label={t('register')}
                />
              </div>
            </Show>
          </div>
        </div>
      </div>

      <div
        class={`fixed inset-0 bg-black opacity-50 z-20 transition-opacity duration-300 ${sidebarOpen() ? 'block' : 'hidden'} md:hidden`}
        onClick={() => setSidebarOpen(false)}
      />

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
