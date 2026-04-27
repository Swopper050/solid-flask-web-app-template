import { createSignal, JSXElement, Show, onMount } from 'solid-js'
import { A, useSearchParams } from '@solidjs/router'

import { Alert } from '../components/Alert'
import { AuthCard } from '../components/AuthCard'
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
    <AuthCard title={t('verifying_email')} subtitle="">
      <Show when={loading()}>
        <div class="flex justify-center py-4">
          <span class="loading loading-ball text-primary loading-lg" />
        </div>
      </Show>

      <Show when={errorMsg()}>
        <Alert type="error" message={errorMsg()} />
      </Show>

      <Show when={success()}>
        <Alert type="success" message={t('successfully_verified_email')} />
      </Show>

      <Show when={!loading()}>
        <div class="mt-4 text-center">
          <A class="btn btn-primary btn-sm" href="/home">
            {t('back_to_home')}
          </A>
        </div>
      </Show>
    </AuthCard>
  )
}
