import { createSignal, createEffect, JSXElement } from 'solid-js'

export function ThemeSwitcher(): JSXElement {
  const [isDark, setIsDark] = createSignal<boolean>(
    JSON.parse(localStorage.getItem('isDark')) ?? false
  )

  createEffect(() => {
    localStorage.setItem('isDark', JSON.stringify(isDark()))
    document.documentElement.setAttribute(
      'data-theme',
      isDark() ? 'dark' : 'light'
    )
  })

  return (
    <label class="swap swap-rotate mx-2">
      <input
        type="checkbox"
        class="theme-controller"
        checked={isDark()}
        value="dark"
        onChange={() => setIsDark(!isDark())}
      />

      <span class="swap-off fill-current">
        <i class="fa-regular fa-sun" />
      </span>

      <span class="swap-on fill-current">
        <i class="fa-regular fa-moon" />
      </span>
    </label>
  )
}
