export async function get(
  url: string,
  asJson: boolean = true,
  withToken: boolean = true
) {
  return fetch(url, { headers: getHeaders(asJson, withToken) })
}

export async function put(
  url: string,
  data: string,
  asJson: boolean = true,
  withToken: boolean = true
) {
  return fetch(url, {
    headers: getHeaders(asJson, withToken),
    method: 'PUT',
    body: data,
  })
}

export async function post(
  url: string,
  data: string | FormData,
  asJson: boolean = true,
  withToken: boolean = true
) {
  return fetch(url, {
    headers: getHeaders(asJson, withToken),
    method: 'POST',
    body: data,
  })
}

function getHeaders(asJson: boolean, withToken: boolean): Headers {
  const headers = new Headers()
  if (asJson) {
    headers.set('Content-Type', 'application/json')
  }

  if (withToken) {
    headers.set(
      'Authorization',
      `Bearer ${localStorage.getItem('access_token')}`
    )
  }

  return headers
}
