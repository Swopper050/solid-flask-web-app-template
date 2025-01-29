import { JSXElement } from 'solid-js'
import { useLocale } from '../context/LocaleProvider'

export function Home(): JSXElement {
  const { t } = useLocale()

  return <div class="m-3">{t('this_is_the_home_page')}</div>
}
