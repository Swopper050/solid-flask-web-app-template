import { JSXElement, Show } from 'solid-js'

import { lazy } from 'solid-js'
import { Navigate } from '@solidjs/router'
import type { RouteDefinition } from '@solidjs/router'

import { useUser } from './context'
import { LandingPage } from './pages/LandingPage'
import { Home } from './pages/Home'
import { BasePage } from './pages/BasePage'

function ProtectedRoute(props: { route: () => JSXElement }): JSXElement {
  const { user, loading } = useUser()

  console.log(loading())
  console.log(localStorage.getItem('access_token'))
  console.log(user())

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
    path: '/about',
    component: lazy(() => import('./pages/About')),
  },
  //{
  //path: '**',
  //component: lazy(() => import('./errors/404')),
  //},
]
