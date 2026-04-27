import { createEffect, createSignal, JSXElement, Match, Switch } from 'solid-js'
import { useNavigate, useSearchParams } from '@solidjs/router'

import { useLocale } from '../context/LocaleProvider'
import { useUser } from '../context/UserProvider'
import { useWorkspace } from '../context/WorkspaceProvider'
import { acceptInvitation } from '../api'
import { Button } from '../components/Button'

type AcceptState = 'idle' | 'loading' | 'error'

export function AcceptInvitationPage(): JSXElement {
  const { t } = useLocale()
  const { user, loading: userLoading } = useUser()
  const { fetchWorkspaces, setCurrentWorkspace } = useWorkspace()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const token = () => params.token as string | undefined
  const [acceptState, setAcceptState] = createSignal<AcceptState>('idle')

  createEffect(() => {
    if (userLoading()) return
    if (!token()) {
      setAcceptState('error')
      return
    }

    if (!user()) {
      const acceptUrl = `/accept-invitation?token=${encodeURIComponent(token()!)}`
      navigate(`/login?redirect=${encodeURIComponent(acceptUrl)}`, {
        replace: true,
      })
      return
    }

    if (acceptState() === 'idle') {
      setAcceptState('loading')
      const tok = token()!
      ;(async () => {
        try {
          const response = await acceptInvitation(tok)
          if (!response.ok) {
            setAcceptState('error')
            return
          }
          const body = await response.json()
          await fetchWorkspaces()
          setCurrentWorkspace(body)
          navigate('/home', { replace: true })
        } catch {
          setAcceptState('error')
        }
      })()
    }
  })

  return (
    <div class="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <Switch>
        <Match when={acceptState() === 'loading' || userLoading()}>
          <div class="flex flex-col items-center gap-3">
            <span class="loading loading-spinner loading-lg" />
          </div>
        </Match>

        <Match when={acceptState() === 'error'}>
          <div class="card bg-base-100 shadow-lg p-8 flex flex-col items-center gap-4 max-w-sm w-full">
            <i class="fa-solid fa-circle-xmark text-error text-4xl" />
            <h2 class="text-xl font-bold text-center">
              {t('invitation_not_found')}
            </h2>
            <Button
              label={t('back_to_home')}
              variant="ghost"
              onClick={() => navigate('/home')}
            />
          </div>
        </Match>
      </Switch>
    </div>
  )
}
