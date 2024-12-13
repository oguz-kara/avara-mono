'use client'
import React from 'react'
import {
  List,
  ListItem,
  ListItemText,
  Card,
  Typography,
  Box,
  Skeleton,
} from '@mui/material'
import Link from 'next/link'
import { useQuery } from '@avc/lib/hooks/use-query'
import { GET_CHANNELS } from '@avc/graphql/queries'
import { Channel } from '@avc/generated/graphql'

export default function ChannelListing() {
  const { data, loading } = useQuery(GET_CHANNELS)
  const channels = data?.channels || []

  if (loading) {
    return (
      <Card>
        <List>
          {[1, 2, 3].map((i) => (
            <ListItem key={i} divider>
              <ListItemText
                primary={<Skeleton width={200} />}
                secondary={<Skeleton width={150} />}
              />
            </ListItem>
          ))}
        </List>
      </Card>
    )
  }

  if (channels.length === 0) {
    return (
      <Card sx={{ p: 4 }}>
        <Typography variant="body1" color="textSecondary" align="center">
          Henüz kanal bulunmuyor
        </Typography>
      </Card>
    )
  }

  return (
    <Card>
      <List>
        {channels.map((channel: Channel) => (
          <ListItem
            key={channel.id}
            divider
            component={Link}
            href={`/kanallar/${channel.id}`}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <ListItemText
              secondaryTypographyProps={{ component: 'div' }}
              primary={
                <Typography variant="subtitle1" fontWeight="medium">
                  {channel.name}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      backgroundColor: 'action.selected',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {channel.code}
                  </Typography>
                  {channel.isDefault && (
                    <Typography
                      variant="caption"
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      Varsayılan
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Card>
  )
}
