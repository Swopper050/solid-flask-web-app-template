import type { ParentProps } from 'solid-js'

const App = (props: ParentProps) => {
  return <main>{props.children}</main>
}

export default App
