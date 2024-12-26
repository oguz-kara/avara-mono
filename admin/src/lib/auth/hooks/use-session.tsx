'use client'

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import { Session } from '../types'

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface SessionContextType extends Session {
  status: SessionStatus
  signIn: (
    provider: string,
    { username, password }: { username: string; password: string },
    callback?: () => void
  ) => Promise<void>
  signOut: (callback?: () => void) => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({
  children,
  initialSession,
}: {
  children: ReactNode
  initialSession: Session | null
}) {
  const [data, setData] = useState<Session | null>(initialSession)
  const [status, setStatus] = useState<SessionStatus>(
    initialSession?.status || 'unauthenticated'
  )

  const signIn = useCallback(
    async (
      provider: string,
      { username, password }: { username: string; password: string },
      callback?: () => void
    ) => {
      try {
        setStatus('loading')
        const response = await clientFetcher('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })

        if (response.ok) {
          setStatus('authenticated')
          callback?.()
        }
      } catch (err: any) {
        console.error(err)
        setStatus('unauthenticated')
      }
    },
    []
  )

  const signOut = useCallback(async (callback?: () => void) => {
    try {
      setStatus('loading')
      const response = await clientFetcher('/auth/logout', {
        method: 'GET',
      })

      if (response.ok) {
        setStatus('unauthenticated')
        callback?.()
      }
    } catch (err: any) {
      console.error(err)
      setStatus('unauthenticated')
    }
  }, [])

  return (
    <SessionContext.Provider value={{ ...data, status, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}

/**
 * Hook to consume the SessionContext
 */
export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used inside a <SessionProvider>')
  }
  return context
}

function clientFetcher(url: string, options: RequestInit) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  return fetch(`${baseUrl}${url}`, options)
}
