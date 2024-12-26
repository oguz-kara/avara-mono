import { redirect } from 'next/navigation'

export const authFetcher = async (url: string, options?: RequestInit) => {
  try {
    const keycloakIssuer = process.env.KEYCLOAK_ISSUER
    const baseUrl = `${keycloakIssuer}${url}`
    const response = await fetch(baseUrl, options)
    if (response.status === 401) {
      redirect('/kimlik-dogrulama')
    }
    return response
  } catch (err: any) {
    console.log('auth fetcher error', err)
    throw err
  }
}
