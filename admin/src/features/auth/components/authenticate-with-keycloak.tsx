import React from 'react'
import AuthStatus from './auth-status'
import { Box } from '@mui/material'

export default function AuthenticateWithKeycloak() {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <AuthStatus />
    </Box>
  )
}
