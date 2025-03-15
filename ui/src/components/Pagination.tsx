import { JSXElement, Show } from 'solid-js'

import { useLocale } from '../context/LocaleProvider'
import { IconButton } from './Button'

interface PaginationProps {
  page: number
  totalPages: number | undefined
  refetch: (page: number) => void
}

export function Pagination(props: PaginationProps): JSXElement {
  const { t } = useLocale()

  const onPageChange = (newPage: number) => {
    props.refetch(newPage)
  }

  return (
    <div class="flex justify-center items-center gap-4">
      <IconButton
        icon="fa-solid fa-arrow-left-long"
        onClick={() => onPageChange(props.page - 1)}
        disabled={props.page === 1}
      />

      <div class="flex gap-2">
        <p class="font-bold">{props.page}</p>
        <p>{t('of')}</p>
        <p class="w-2">
          <Show
            when={props.totalPages !== undefined}
            fallback={<span class="loading loading-ball loading-xs" />}
          >
            {props.totalPages}
          </Show>
        </p>
      </div>

      <IconButton
        icon="fa-solid fa-arrow-right-long"
        onClick={() => onPageChange(props.page + 1)}
        disabled={
          props.totalPages === undefined || props.page >= props.totalPages
        }
      />
    </div>
  )
}
