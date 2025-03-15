import './index.css'

import { Suspense, type ParentProps, For } from 'solid-js'
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router'
import { routes } from './routes'
import { UserProvider } from './context/UserProvider'
import { LocaleProvider } from './context/LocaleProvider'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  )
}

if (root === null) {
  throw new Error('Root element is null')
}

const RootLayout = (props: ParentProps) => (
  <UserProvider>
    <LocaleProvider>
      <Suspense>{props.children}</Suspense>
    </LocaleProvider>
  </UserProvider>
)

render(
  () => (
    <Router root={RootLayout}>
      <For each={routes}>
        {(route) => <Route path={route.path} component={route.component} />}
      </For>
    </Router>
  ),
  root
)
