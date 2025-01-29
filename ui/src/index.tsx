/* @refresh reload */
import './index.css'

import { Suspense } from 'solid-js'
import { render } from 'solid-js/web'
import { Router } from '@solidjs/router'
import App from './App'
import { UserProvider } from './context/UserProvider'
import { LocaleProvider } from './context/LocaleProvider'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  )
}

render(
  () => (
    <Router>
      <UserProvider>
        <LocaleProvider>
          <Suspense>
            <App />
          </Suspense>
        </LocaleProvider>
      </UserProvider>
    </Router>
  ),
  root
)
