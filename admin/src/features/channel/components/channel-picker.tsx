'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Autocomplete,
  TextField,
  Typography,
  Box,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Channel } from '@avc/generated/graphql'
import useChannel from '../hooks/use-channel'

const ChannelPicker: React.FC = () => {
  const router = useRouter()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const { currentChannel, changeChannel, channels } = useChannel()

  const handleChange = (event: any, value: Channel | null) => {
    if (value && value.id !== currentChannel?.id) {
      changeChannel(value)
      router.push('/kanallar')
    }
  }

  return (
    <Autocomplete
      size="small"
      options={channels}
      getOptionLabel={(option) => option.name}
      value={currentChannel || undefined}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="Select Channel"
          size={isSmallScreen ? 'small' : 'medium'}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 24,
                height: 24,
              }}
            >
              {option.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">{option.name}</Typography>
              <Typography variant="caption" color="textSecondary">
                {option.code} • {option.type}
              </Typography>
            </Box>
            {option.isDefault && (
              <Chip label="Default" size="small" color="primary" />
            )}
          </Box>
        </li>
      )}
      sx={{
        width: 300,
        [theme.breakpoints.down('sm')]: {
          width: '100%',
        },
      }}
      disableClearable
    />
  )
}

export default ChannelPicker
