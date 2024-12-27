import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@avc/lib/auth'
import { errorCodes } from '@avc/lib/error'
import { BaseError } from '@avc/lib/error/base-error'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    const authService = AuthService.createInstance()

    await authService.login(username, password)

    const responseData = { message: 'LOGIN_SUCCESS' }
    const res = NextResponse.json(responseData, { status: 200 })

    return res
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Something went wrong',
        errorCode:
          error instanceof BaseError
            ? error.errorCode
            : errorCodes.LOGIN_FAILED,
      },
      { status: 500 }
    )
  }
}
