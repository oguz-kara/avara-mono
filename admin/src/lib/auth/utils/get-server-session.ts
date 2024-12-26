import 'server-only'
import { cookies } from 'next/headers'
import { AuthService } from '../application/auth.service'
import { Session } from '../types'

export async function getServerSession(): Promise<Session | null> {
  const authService = AuthService.createInstance()

  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) {
    return null
  }

  try {
    const userInfo = await authService.fetchUserInfo(accessToken)
    return {
      user: {
        id: userInfo.sub,
        username: userInfo.preferred_username,
        email: userInfo.email,
        roles: userInfo.roles || [], // Optional if roles are mapped
      },
      status: 'authenticated',
    }
  } catch (err) {
    console.error('Failed to fetch user info:', err)
    return null
  }
}
