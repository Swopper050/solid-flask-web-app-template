import { JSXElement, Show } from 'solid-js'

import { useLocale } from '../context/LocaleProvider'

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
      <button
        class="btn btn-small btn-ghost"
        onClick={() => onPageChange(props.page - 1)}
        disabled={props.page === 1}
      >
        <i class="fa-solid fa-arrow-left-long" />
      </button>

      <div class="flex gap-2">
        <p class="font-bold">{props.page}</p>
        <p>{t('of')}</p>
        <Show
          when={props.totalPages !== undefined}
          fallback={<p class="loading loading-xs" />}
        >
          <p>{props.totalPages}</p>
        </Show>
      </div>

      <button
        class="btn btn-small btn-ghost"
        onClick={() => onPageChange(props.page + 1)}
        disabled={props.page >= props.totalPages}
      >
        <i class="fa-solid fa-arrow-right-long" />
      </button>
    </div>
  )
}
