import { JSXElement } from 'solid-js'
import { Navigate, useSearchParams } from '@solidjs/router'

/**
 * Redirects legacy /billing and /billing/checkout URLs to the home,
 * preserving billing status query params so the modal opens automatically.
 */
export function BillingRedirect(): JSXElement {
  const [searchParams] = useSearchParams()

  const status = searchParams.status as string | undefined
  const workspaceId = searchParams.workspace_id as string | undefined

  const params = new URLSearchParams()
  if (status) params.set('billing_status', status)
  if (workspaceId) params.set('workspace_id', workspaceId)

  const query = params.toString()
  return <Navigate href={`/home${query ? `?${query}` : ''}`} />
}
