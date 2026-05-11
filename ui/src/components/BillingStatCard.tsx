import clsx from 'clsx'
import { JSXElement } from 'solid-js'

interface BillingStatCardProps {
  value: JSXElement
  label: JSXElement
  /** Extra classes for the value text (e.g. to colour the trial-days countdown). */
  valueClass?: string
}

/** One cell of the 3-column stats grid shown inside billing plan cards. */
export function BillingStatCard(props: BillingStatCardProps): JSXElement {
  return (
    <div class="bg-white/70 dark:bg-base-100/50 rounded-lg p-3 text-center">
      <p class={clsx('font-extrabold text-lg', props.valueClass)}>
        {props.value}
      </p>
      <p class="text-[11px] font-semibold text-success/80">{props.label}</p>
    </div>
  )
}
