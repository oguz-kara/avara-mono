import { NextResponse } from 'next/server'
import { AuthService } from '@avc/lib/auth'
import { cookies } from 'next/headers'
import { errorCodes } from '@avc/lib/error'
import { BaseError } from '@avc/lib/error/base-error'
import { serialize } from 'cookie'

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

    await authService.refresh(refreshToken)

    const responseData = { message: 'REFRESH_SUCCESS' }
    const res = NextResponse.json(responseData, { status: 200 })

    return res
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      {
        error: 'Something went wrong',
        errorCode:
          error instanceof BaseError
            ? error.errorCode
            : errorCodes.REFRESH_FAILED,
      },
      { status: 500 }
    )
  }
}
