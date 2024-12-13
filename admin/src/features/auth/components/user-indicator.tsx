'use client'
import React from 'react'
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
} from '@mui/material'
import { deepPurple } from '@mui/material/colors'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import LogoutIcon from '@mui/icons-material/Logout'
import { useUser } from '../context/use-user'
import { useRouter } from 'next/navigation'

const UserIndicator: React.FC = () => {
  const router = useRouter()
  const { currentUser, setCurrentUser, logout } = useUser()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  if (!currentUser) return null // Optionally, render nothing or a login button if user is not logged in

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/kimlik-dogrulama')
  }

  // Extract the first character of the email for the Avatar
  const avatarLetter = currentUser.email.charAt(0).toUpperCase()

  if (!currentUser) return null

  return (
    <Box display="flex" alignItems="center">
      <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 2 }}>
        <Avatar sx={{ bgcolor: deepPurple[500], width: 32, height: 32 }}>
          {avatarLetter}
        </Avatar>
      </IconButton>
      <Typography variant="body1" sx={{ ml: 1, mr: 1 }}>
        {currentUser.email}
      </Typography>
      <IconButton onClick={handleMenuOpen} size="small">
        <ArrowDropDownIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default UserIndicator
