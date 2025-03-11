import { JSXElement } from 'solid-js'

export function Tooltip(props: {
  text: string
  children: JSXElement[] | JSXElement
}): JSXElement {
  return (
    <span class="tooltip tooltip-right" data-tip={props.text}>
      {props.children}
    </span>
  )
}
