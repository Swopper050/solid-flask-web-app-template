import { createSignal, JSXElement, Show, onMount } from 'solid-js'
import { A, useSearchParams } from '@solidjs/router'

import { Alert } from '../components/Alert'
import { TopBar } from '../components/TopBar'

import { useUser } from '../context/UserProvider'
import { useLocale } from '../context/LocaleProvider'
import { getErrorMessage, verifyEmail } from '../api'
import { getSingleParam } from './SearchParams'

export function VerifyEmailPage(): JSXElement {
  const { t } = useLocale()

  const [searchParams] = useSearchParams()
  const { fetchUser } = useUser()

  const [loading, setLoading] = createSignal(true)
  const [success, setSuccess] = createSignal(false)
  const [errorMsg, setErrorMsg] = createSignal<string>()

  onMount(async () => {
    setLoading(true)
    setSuccess(false)

    const response = await verifyEmail(
      getSingleParam(searchParams.email),
      getSingleParam(searchParams.verification_token)
    )

    if (response.status !== 200) {
      const data = await response.json()
      setErrorMsg(t(getErrorMessage(data)))
    } else {
      await fetchUser()
      setSuccess(true)
    }

    setLoading(false)
  })

  return (
    <>
      <TopBar />

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">{t('verifying_email')}</h1>
      </div>

      <Show when={loading()}>
        <div class="flex justify-center items-center mt-10">
          <span class="loading loading-ball text-neutral loading-lg" />
        </div>
      </Show>

      <Show when={errorMsg()}>
        <div class="flex justify-center">
          <Alert type="error" message={errorMsg()} class="w-96" />
        </div>
      </Show>

      <Show when={success()}>
        <div class="flex justify-center">
          <Alert
            type="success"
            message={t('successfully_verified_email')}
            class="w-96"
          />
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
