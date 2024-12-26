import type { Metadata } from 'next'
import localFont from 'next/font/local'
import CssBaseline from '@mui/material/CssBaseline'
import Providers from '@avc/providers'
import { ChannelProvider } from '@avc/features/channel/context/channel-contex'
import { initializeSDK } from '@avc/lib/sdk'
import './globals.css'
import { getServerSession } from '@avc/lib/auth'
import { SessionProvider } from '@avc/lib/auth/hooks/use-session'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Restoreplus',
  description: 'Restoreplus',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession()


  const sdk = await initializeSDK()

  const channels = session ? await sdk.channels.getChannels() : []

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ overflow: 'hidden' }}
      >
        <Providers>
          <CssBaseline />
          <ChannelProvider initialChannels={channels}>
            <SessionProvider initialSession={session}>
              {children}
            </SessionProvider>
          </ChannelProvider>
        </Providers>
      </body>
    </html>
  )
}
