import { createSignal, JSXElement, Show, onMount } from 'solid-js'
import { A, useSearchParams } from '@solidjs/router'

import { ThemeSwitcher } from '../components/ThemeSwitcher'

import { useUser } from '../context'
import api from '../api'

export function VerifyEmailPage(): JSXElement {
  const [searchParams] = useSearchParams()
  const { fetchUser } = useUser()

  const [loading, setLoading] = createSignal(true)
  const [success, setSuccess] = createSignal(false)
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)

  onMount(() => {
    setLoading(true)
    setSuccess(false)
    setErrorMsg(null)

    api
      .post(
        '/verify_email',
        JSON.stringify({
          email: searchParams.email,
          verification_token: searchParams.verification_token,
        })
      )
      .then(async () => {
        await fetchUser()
        setSuccess(true)
      })
      .catch((error) => {
        setErrorMsg(
          error.response.data.error_message ??
            'Could not verify email, please try again later'
        )
      })
      .finally(() => {
        setLoading(false)
      })
  })

  return (
    <>
      <div class="navbar fixed bg-base-100 top-0 left-0">
        <div class="flex-1" />
        <ThemeSwitcher />
      </div>

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">{'Verifying email'}</h1>
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
            <span>Successfully verified email</span>
          </div>
        </div>
      </Show>

      <Show when={!loading()}>
        <div class="flex justify-center mt-10">
          <A class="btn btn-primary btn-outline" href="/home">
            Back to home
          </A>
        </div>
      </Show>
    </>
  )
}
