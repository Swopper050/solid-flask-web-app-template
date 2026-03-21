import { JSXElement, Switch, Match, Show, type Component } from 'solid-js'
import { Navigate, Route } from '@solidjs/router'
import type { RouteSectionProps } from '@solidjs/router'

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

function FullscreenLoader(): JSXElement {
  return (
    <div class="flex flex-col justify-center items-center h-screen w-screen">
      <div class="loading loading-ball text-neutral loading-lg mb-3" />
      <div class="text-lg text-neutral font-bold">Loading...</div>
    </div>
  )
}

function RootRedirect(): JSXElement {
  const { user, loading } = useUser()

  return (
    <Switch>
      <Match when={loading()}>
        <FullscreenLoader />
      </Match>
      <Match when={!loading() && user() !== null}>
        <Navigate href="/home" />
      </Match>
      <Match when={!loading() && user() === null}>
        <Navigate href="/login" />
      </Match>
    </Switch>
  )
}

function AppRoute(props: RouteSectionProps): JSXElement {
  const { user, loading } = useUser()

  return (
    <Switch>
      <Match when={loading()}>
        <FullscreenLoader />
      </Match>
      <Match when={!loading() && !user()}>
        <Navigate href="/login" />
      </Match>
      <Match when={user()}>
        <BasePage>{props.children}</BasePage>
      </Match>
    </Switch>
  )
}

function adminOnly<T extends RouteSectionProps>(
  Comp: Component<T>
): Component<T> {
  return (props: T) => {
    const { user } = useUser()

    return (
      <Show when={user()?.isAdmin} fallback={<Navigate href="/home" />}>
        <Comp {...props} />
      </Show>
    )
  }
}

export function RouteTree(): JSXElement {
  return (
    <>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />

      <Route path="" component={AppRoute}>
        <Route path="/home" component={Home} />
        <Route path="/account" component={UserAccountPage} />
        <Route path="/admin-panel" component={adminOnly(AdminPage)} />
      </Route>

      <Route path="**" component={NotFoundPage} />
    </>
  )
}
