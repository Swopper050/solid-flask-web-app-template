import { createSignal, JSXElement, Show, onMount } from 'solid-js'
import { A, useSearchParams } from '@solidjs/router'

import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { LanguageSelector } from '../components/LanguageSelector'

import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { verifyEmail } from '../api'

export function VerifyEmailPage(): JSXElement {
  const { t } = useLocale()

  const [searchParams] = useSearchParams()
  const { fetchUser } = useUser()

  const [loading, setLoading] = createSignal(true)
  const [success, setSuccess] = createSignal(false)
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)

  onMount(async () => {
    setLoading(true)
    setSuccess(false)
    setErrorMsg(null)

    const response = await verifyEmail(
      searchParams.email,
      searchParams.verification_token
    )

    if (response.status !== 200) {
      setErrorMsg((await response.json()).error_message)
    } else {
      await fetchUser()
      setSuccess(true)
    }

    setLoading(false)
  })

  return (
    <>
      <div class="navbar fixed bg-base-100 top-0 left-0">
        <div class="flex-1" />
        <ThemeSwitcher />
        <LanguageSelector />
      </div>

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">{t('verifying_email')}</h1>
      </div>

      <Show when={loading()}>
        <div class="flex justify-center items-center mt-10">
          <span class="loading loading-ball text-neutral loading-lg" />
        </div>
      </Show>

      <Show when={errorMsg() !== null}>
        <div class="flex justify-center mt-10">
          <div role="alert" class="alert alert-error w-80">
            <span>{errorMsg()}</span>
          </div>
        </div>
      </Show>

      <Show when={success()}>
        <div class="flex justify-center mt-10">
          <div role="alert" class="alert alert-success w-80">
            <span>{t('successfully_verified_email')}</span>
          </div>
        </div>
      </Show>

      <Show when={!loading()}>
        <div class="flex justify-center mt-10">
          <A class="btn btn-primary btn-outline" href="/home">
            {t('back_to_home')}
          </A>
        </div>
      </Show>
    </>
  )
}
