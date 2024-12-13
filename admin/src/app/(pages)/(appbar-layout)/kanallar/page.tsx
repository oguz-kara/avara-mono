'use client'
import React from 'react'
import { Box, Button, Typography, Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import AddIcon from '@mui/icons-material/Add'
import ChannelListing from '@avc/features/channel/components/channel-listing'

export default function ChannelsPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Kanallar
          </Typography>
          <Breadcrumbs>
            <Typography color="text.primary">Ayarlar</Typography>
            <Typography color="textSecondary">Kanallar</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          component={Link}
          href="/kanallar/yeni"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Yeni Kanal
        </Button>
      </Box>

      <ChannelListing />
    </Box>
  )
}
