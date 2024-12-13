import type { Metadata } from 'next'
import localFont from 'next/font/local'
import CssBaseline from '@mui/material/CssBaseline'
import Providers from '@avc/providers'
import { ChannelProvider } from '@avc/features/channel/context/channel-contex'
import { initializeSDK } from '@avc/lib/sdk'
import './globals.css'
import { UserProvider } from '@avc/features/auth/context/use-user'
import { getServersideUser } from '@avc/features/auth/api/get-server-user'

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
  const sdk = await initializeSDK()

  const channels = await sdk.channels.getChannels()
  const user = await getServersideUser()

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ overflow: 'hidden' }}
      >
        <Providers>
          <CssBaseline />
          <UserProvider initialUser={user}>
            <ChannelProvider initialChannels={channels}>
              {children}
            </ChannelProvider>
          </UserProvider>
        </Providers>
      </body>
    </html>
  )
}
