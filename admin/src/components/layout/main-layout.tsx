import React from 'react'
import NavBar from './navbar'
import Box from '../ui/box'
import { navbarItems } from '@avc/navbar-items'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <NavBar navbarItems={navbarItems as any} />
      {children}
    </Box>
  )
}
