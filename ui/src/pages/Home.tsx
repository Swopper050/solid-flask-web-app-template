import { JSXElement } from 'solid-js'
import { useLocale } from '../context/LocaleProvider'

export function Home(): JSXElement {
  const { t } = useLocale()

  return (
    <div class="p-4 md:p-6 lg:p-8">
      <h1 class="text-2xl md:text-3xl font-bold mb-4">
        {t('this_is_the_home_page')}
      </h1>
    </div>
  )
}
