'use client'
import { ReactNode } from 'react'
import { SessionContextProvider, useSession } from './use-session'

export const SessionContextWrapper = ({
  children,
}: {
  children: ReactNode
}) => {
  const session = useSession()
  return (
    <SessionContextProvider session={session}>
      {children}
    </SessionContextProvider>
  )
}
