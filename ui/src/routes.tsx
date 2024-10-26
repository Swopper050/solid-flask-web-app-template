import { JSXElement, Show } from 'solid-js'

import { Navigate } from '@solidjs/router'
import type { RouteDefinition } from '@solidjs/router'

import { useUser } from './context'
import { LandingPage } from './pages/LandingPage'
import { Home } from './pages/Home'
import { BasePage } from './pages/BasePage'
import { UserProfilePage } from './pages/UserProfilePage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { NotFoundPage } from './pages/NotFoundPage'

function ProtectedRoute(props: { route: () => JSXElement }): JSXElement {
  const { user, loading } = useUser()

  return (
    <Show
      when={!loading() && user() === null}
      fallback={
        <Show when={loading()} fallback={props.route()}>
          <div class="flex flex-col justify-center items-center h-screen w-screen">
            <div class="loading loading-ball text-neutral loading-lg mb-3" />
            <div class="text-lg text-neutral font-bold">Loading...</div>
          </div>
        </Show>
      }
    >
      <Navigate href="/" />
    </Show>
  )
}

export default ProtectedRoute

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: () => <LandingPage />,
  },
  {
    path: '/home',
    component: () => (
      <ProtectedRoute route={() => <BasePage mainComponent={Home} />} />
    ),
  },
  {
    path: '/profile',
    component: () => (
      <ProtectedRoute
        route={() => <BasePage mainComponent={UserProfilePage} />}
      />
    ),
  },
  {
    path: '/forgot-password',
    component: () => <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    component: () => <ResetPasswordPage />,
  },
  {
    path: '**',
    component: () => <NotFoundPage />,
  },
]
