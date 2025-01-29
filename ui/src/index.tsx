/* @refresh reload */
import './index.css'

import { Suspense } from 'solid-js'
import { render } from 'solid-js/web'
import { Router } from '@solidjs/router'
import App from './App'
import { UserProvider } from './context/UserProvider'
import { I18nProvider } from './context/I18nProvider'

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
        <I18nProvider>
          <Suspense>
            <App />
          </Suspense>
        </I18nProvider>
      </UserProvider>
    </Router>
  ),
  root
)
