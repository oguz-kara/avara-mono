import { NextRequest, NextResponse } from 'next/server'
import { AuthService, getServerTokens, ServerTokens } from './lib/auth'

export async function middleware(req: NextRequest) {
  const tokens = await getServerTokens()

  if (!tokens?.refreshToken) {
    return NextResponse.redirect(new URL('/kimlik-dogrulama', req.url))
  }

  const authService = AuthService.createInstance()
  if (tokens?.refreshToken && !tokens?.accessToken) {
    await authService.refresh(tokens.refreshToken)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|kimlik-dogrulama).*)',
  ],
}
