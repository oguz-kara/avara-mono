import 'server-only'
import { cookies } from 'next/headers'
import { authFetcher } from '../utils/auth-fetcher'
import { authRoutes } from './routes'
import { BaseError } from '../../error/base-error'
import { errorCodes } from '../../error'
import { getServerTokens } from '../utils/get-server-tokens'

export class AuthService {
  KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER
  KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID
  KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET

  static createInstance() {
    return new AuthService()
  }

  async login(username: string, password: string) {
    try {
      const response = await authFetcher(authRoutes.TOKEN_ISSUER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: this.KEYCLOAK_CLIENT_ID ?? '',
          client_secret: this.KEYCLOAK_CLIENT_SECRET ?? '',
          username,
          password,
          scope: 'openid',
        }).toString(),
      })

      if (!response.ok)
        throw new BaseError(
          'Invalid credentials',
          errorCodes.INVALID_CREDENTIALS
        )

      const data = await response.json()
      const { access_token, refresh_token, expires_in } = data

      await setCookies(access_token, refresh_token, expires_in)

      return { access_token, refresh_token, expires_in }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async refresh(refreshToken: string) {
    try {
      const response = await authFetcher(authRoutes.TOKEN_ISSUER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.KEYCLOAK_CLIENT_ID ?? '',
          client_secret: this.KEYCLOAK_CLIENT_SECRET ?? '',
          refresh_token: refreshToken,
          scope: 'openid',
        }).toString(),
      })

      console.log('Refresh response:', response)

      if (!response.ok) this.logout(refreshToken)

      const data = await response.json()

      console.log('Refresh data:', data)

      const { access_token, refresh_token, expires_in } = data

      await setCookies(access_token, refresh_token, expires_in)

      return { access_token, refresh_token, expires_in }
    } catch (error) {
      console.error('Refresh error:', error)
      throw error
    }
  }

  async logout(refreshToken: string) {
    try {
      const cookieStore = await cookies()
      const response = await authFetcher(authRoutes.LOGOUT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.KEYCLOAK_CLIENT_ID ?? '',
          client_secret: this.KEYCLOAK_CLIENT_SECRET ?? '',
          refresh_token: refreshToken,
        }).toString(),
      })

      if (!response.ok) {
        throw new BaseError('Failed to log out', errorCodes.LOGOUT_FAILED)
      }

      cookieStore.delete('access_token')
      cookieStore.delete('refresh_token')

      return true
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  async fetchUserInfo(accessToken: string) {
    const response = await authFetcher(authRoutes.USER_INFO, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    console.log('User info response:', response)

    if (!response.ok) {
      throw new Error('Failed to fetch user info')
    }

    return await response.json()
  }
}

async function setCookies(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  const cookieStore = await cookies()
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.SSL === 'active',
    path: '/',
    maxAge: expiresIn,
    sameSite: 'lax',
  })

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.SSL === 'active',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
    sameSite: 'lax',
  })
}
