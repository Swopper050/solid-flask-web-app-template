import { For, JSXElement } from 'solid-js'

export function TableRow(props: {
  cells: (JSXElement | string)[]
}): JSXElement {
  return (
    <tr>
      <For each={props.cells}>
        {(cell, index) => (
          <td class={index() === props.cells.length - 1 ? 'text-end' : ''}>
            {cell}
          </td>
        )}
      </For>
    </tr>
  )
}

export function Table(props: {
  headers?: (string | JSXElement)[]
  children: (JSXElement | string)[] | JSXElement
}): JSXElement {
  const headerLength = () => (props.headers?.length ? props.headers.length : 0)

  return (
    <div>
      <table class="table table-fixed">
        {props.headers && (
          <thead>
            <tr>
              <For each={props.headers}>
                {(header, index) => (
                  <th class={index() === headerLength() - 1 ? 'text-end' : ''}>
                    {header}
                  </th>
                )}
              </For>
            </tr>
          </thead>
        )}
        <tbody>{props.children}</tbody>
      </table>
    </div>
  )
}
