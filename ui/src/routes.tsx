import { JSXElement, Switch, Match } from 'solid-js'

import { Navigate } from '@solidjs/router'
import type { RouteDefinition } from '@solidjs/router'

import { useUser } from './context/UserProvider'
import { AdminPanelPage } from './pages/admin_panel_page/AdminPanelPage'
import { LandingPage } from './pages/LandingPage'
import { Home } from './pages/Home'
import { BasePage } from './pages/BasePage'
import { UserAccountPage } from './pages/user_account_page/UserAccountPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { NotFoundPage } from './pages/NotFoundPage'

function ProtectedRoute(props: {
  route: () => JSXElement
  adminOnly?: boolean
}): JSXElement {
  const { user, loading } = useUser()

  return (
    <Switch fallback={props.route()}>
      <Match when={!loading() && user() === null}>
        <Navigate href="/" />
      </Match>
      <Match when={!loading() && props.adminOnly && !user().isAdmin}>
        <Navigate href="/" />
      </Match>
      <Match when={loading()}>
        <div class="flex flex-col justify-center items-center h-screen w-screen">
          <div class="loading loading-ball text-neutral loading-lg mb-3" />
          <div class="text-lg text-neutral font-bold">Loading...</div>
        </div>
      </Match>
    </Switch>
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
    path: '/account',
    component: () => (
      <ProtectedRoute
        route={() => <BasePage mainComponent={UserAccountPage} />}
      />
    ),
  },
  {
    path: '/admin-panel',
    component: () => (
      <ProtectedRoute
        adminOnly={true}
        route={() => <BasePage mainComponent={AdminPanelPage} />}
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
    path: '/verify-email',
    component: () => <VerifyEmailPage />,
  },
  {
    path: '**',
    component: () => <NotFoundPage />,
  },
]
