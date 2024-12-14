'use client'
import { UserType } from '@avc/generated/graphql'
import { GET_ACTIVE_USER } from '@avc/graphql/queries'
import { useQuery } from '@avc/lib/hooks/use-query'
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface UserContextProps {
  currentUser: UserType | null
  setCurrentUser: (user: UserType | null) => void
  logout: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
}

const UserContext = createContext<UserContextProps | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
  initialUser: UserType | null
}

export const UserProvider: React.FC<UserProviderProps> = ({
  children,
  initialUser = null,
}) => {
  const [currentUser, setCurrentUserState] = useState<UserType | null>(
    () => initialUser
  )
  const { refetch } = useQuery(GET_ACTIVE_USER, {
    skip: true,
  })

  const setCurrentUser = (user: UserType | null) => {
    setCurrentUserState(user)
  }

  const fetchCurrentUser = async () => {
    const response = await refetch()
    setCurrentUser(response.data?.activeUser)
  }

  const logout = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ADMIN_API_URL}/logout`
    )
    const data = await response.json()
    if (data.success) {
      setCurrentUser(null)
    }
  }

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser, logout, fetchCurrentUser }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}
