import { NextResponse } from 'next/server'
import { AuthService } from '@avc/lib/auth'
import { cookies } from 'next/headers'
import { errorCodes } from '@avc/lib/error'
import { BaseError } from '@avc/lib/error/base-error'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value
    if (!refreshToken) {
      return NextResponse.json(
        {
          error: 'No session found',
          errorCode: errorCodes.NO_SESSION,
        },
        { status: 400 }
      )
    }
    const authService = AuthService.createInstance()

    const success = await authService.logout(refreshToken)

    if (!success) {
      return NextResponse.json(
        {
          error: 'Something went wrong when logging out!',
          errorCode: errorCodes.LOGOUT_FAILED,
        },
        { status: 400 }
      )
    }

    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')

    const responseData = { message: 'Logout successful' }
    return NextResponse.json(responseData, { status: 200 })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        error: 'Something went wrong',
        errorCode:
          error instanceof BaseError
            ? error.errorCode
            : errorCodes.LOGOUT_FAILED,
      },
      { status: 500 }
    )
  }
}
