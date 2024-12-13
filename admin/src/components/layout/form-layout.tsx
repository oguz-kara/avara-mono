import React from 'react'
import Paper from '@avc/components/ui/paper'
import Typography from '@avc/components/ui/typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

interface FormLayoutProps {
  title: string | React.ReactNode
  leftContent: React.ReactNode
  rightContent: React.ReactNode
  breadcrumbs?: React.ReactNode
}

export default function FormLayout({
  title,
  leftContent,
  rightContent,
  breadcrumbs,
}: FormLayoutProps) {
  return (
    <Box>
      {breadcrumbs && (
        <Box sx={{ backgroundColor: 'background.paper' }}>{breadcrumbs}</Box>
      )}
      <Stack direction="row" sx={{ height: '100vh', overflow: 'hidden' }}>
        <Paper
          sx={{
            minHeight: '100vh',
            borderRadius: 0,
            flex: 3,
            borderRight: '1px solid',
            borderColor: 'divider',
            pb: 12,
          }}
        >
          <Stack gap={4} direction="column">
            {/* Header */}
            <Box
              sx={{
                py: 4,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              {typeof title === 'string' ? (
                <Typography sx={{ px: 4 }} variant="h5" fontWeight="bold">
                  {title}
                </Typography>
              ) : (
                title
              )}
            </Box>
            <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
              <Stack gap={4} direction="column">
                {leftContent}
              </Stack>
            </Box>
          </Stack>
        </Paper>

        {/* Right Panel */}
        <Box sx={{ flex: 1, p: 2 }}>
          <Stack gap={4} direction="column">
            {rightContent}
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}
