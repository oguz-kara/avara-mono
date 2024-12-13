import { Box, Typography, Tooltip, IconButton } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

interface FormHeaderProps {
  title: string
  tooltip?: string
}

export default function FormHeader({ title, tooltip }: FormHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 2,
        pt: 4,
      }}
    >
      <Typography variant="h6">{title}</Typography>
      {tooltip && (
        <Tooltip title={tooltip}>
          <IconButton size="small">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}
