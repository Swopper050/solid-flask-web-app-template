import { JSXElement } from 'solid-js'
import { useSearchParams } from '@solidjs/router'

import { useLocale } from '../../context/LocaleProvider'
import { useWorkspace } from '../../context/WorkspaceProvider'
import { BillingTabContent } from './BillingTabContent'

export function BillingPage(): JSXElement {
  const { t } = useLocale()
  const { currentWorkspace } = useWorkspace()
  const [searchParams] = useSearchParams()

  const workspaceId = () => currentWorkspace()?.id ?? 0
  const statusMessage = () =>
    searchParams.status === 'success'
      ? ('success' as const)
      : searchParams.status === 'cancelled'
        ? ('cancelled' as const)
        : null

  return (
    <div class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div class="max-w-3xl mx-auto">
        <div class="mb-6">
          <h1 class="text-2xl font-bold">{t('billing')}</h1>
          <p class="text-base-content/60 text-sm mt-1">
            {t('billing_subtitle')}
          </p>
        </div>

        <div class="h-[600px] border border-base-300 rounded-2xl overflow-hidden flex flex-col">
          <BillingTabContent
            workspaceId={workspaceId()}
            statusMessage={statusMessage()}
          />
        </div>
      </div>
    </div>
  )
}
