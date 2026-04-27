import { JSXElement, Show } from 'solid-js'

import { Navigate } from '@solidjs/router'
import type { RouteDefinition } from '@solidjs/router'
import type { Component } from 'solid-js'

import { useUser } from './context/UserProvider'
import { AdminPage } from './pages/admin_page/Admin'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { Home } from './pages/Home'
import { BasePage } from './pages/Base'
import { UserAccountPage } from './pages/user_account_page/UserAccount'
import { ForgotPasswordPage } from './pages/ForgotPassword'
import { ResetPasswordPage } from './pages/ResetPassword'
import { VerifyEmailPage } from './pages/VerifyEmail'
import { NotFoundPage } from './pages/NotFound'
import { AcceptInvitationPage } from './pages/AcceptInvitation'
import { BillingRedirect } from './pages/billing/BillingRedirect'
import { BillingCheckoutPage } from './pages/billing/BillingCheckoutPage'

function ProtectedRoute(props: {
  component: Component
  adminOnly?: boolean
}): JSXElement {
  const { user, loading } = useUser()

  const redirectHref = () =>
    `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`

  return (
    <Show
      when={!loading()}
      fallback={
        <div class="flex flex-col justify-center items-center h-screen w-screen">
          <div class="loading loading-ball text-neutral loading-lg mb-3" />
          <div class="text-lg text-neutral font-bold">Loading...</div>
        </div>
      }
    >
      <Show
        when={user?.() !== null}
        fallback={<Navigate href={redirectHref()} />}
      >
        <Show
          when={!props.adminOnly || user()?.isAdmin}
          fallback={<Navigate href="/home" />}
        >
          <props.component />
        </Show>
      </Show>
    </Show>
  )
}

export default ProtectedRoute

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: () => <Navigate href="/login" />,
  },
  {
    path: '/login',
    component: () => <LoginPage />,
  },
  {
    path: '/register',
    component: () => <RegisterPage />,
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
    path: '/accept-invitation',
    component: () => <AcceptInvitationPage />,
  },
  {
    path: '/billing',
    component: () => <BillingRedirect />,
  },
  {
    path: '/billing/checkout',
    component: () => (
      <ProtectedRoute component={() => <BillingCheckoutPage />} />
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
