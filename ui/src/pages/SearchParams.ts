/**
 * Obtain a single search param when using solidjs searchParams
 */
export function getSingleParam(param: string | string[] | undefined): string {
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '')
}
