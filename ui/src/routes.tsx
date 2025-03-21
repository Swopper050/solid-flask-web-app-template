import { JSXElement, Switch, Match, type Component } from 'solid-js'

import { Navigate } from '@solidjs/router'
import type { RouteDefinition } from '@solidjs/router'

import { useUser } from './context/UserProvider'
import { AdminPage } from './pages/admin_page/Admin'
import { LandingPage } from './pages/Landing'
import { Home } from './pages/Home'
import { BasePage } from './pages/Base'
import { UserAccountPage } from './pages/user_account_page/UserAccount'
import { ForgotPasswordPage } from './pages/ForgotPassword'
import { ResetPasswordPage } from './pages/ResetPassword'
import { VerifyEmailPage } from './pages/VerifyEmail'
import { NotFoundPage } from './pages/NotFound'

function ProtectedRoute(props: {
  component: Component
  adminOnly?: boolean
}): JSXElement {
  const { user, loading } = useUser()

  return (
    <Switch fallback={<props.component />}>
      <Match when={!loading() && user?.() === null}>
        <Navigate href="/" />
      </Match>
      <Match when={!loading() && props.adminOnly && !user()?.isAdmin}>
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
      <ProtectedRoute component={() => <BasePage mainComponent={Home} />} />
    ),
  },
  {
    path: '/account',
    component: () => (
      <ProtectedRoute
        component={() => <BasePage mainComponent={UserAccountPage} />}
      />
    ),
  },
  {
    path: '/admin-panel',
    component: () => (
      <ProtectedRoute
        adminOnly={true}
        component={() => <BasePage mainComponent={AdminPage} />}
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
