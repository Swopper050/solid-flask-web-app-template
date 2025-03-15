import { JSXElement } from 'solid-js'
export function Tooltip(props: {
  text: string
  children: JSXElement[] | JSXElement
  position?: 'left' | 'right'
}): JSXElement {
  const positionClass = () =>
    props.position === 'left' ? 'tooltip-left' : 'tooltip-right'

  return (
    <span class={`tooltip ${positionClass()}`} data-tip={props.text}>
      {props.children}
    </span>
  )
}
