import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const publicPaths = ['/kimlik-dogrulama']

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}`)
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/kimlik-dogrulama'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|kimlik-dogrulama).*)',
  ],
}
