import 'server-only'
import { cookies } from 'next/headers'

export type ServerTokens = {
  accessToken: string | undefined
  refreshToken: string | undefined
}

export async function getServerTokens(): Promise<ServerTokens | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (!accessToken && !refreshToken) {
    return null
  }

  return {
    accessToken,
    refreshToken,
  }
}
