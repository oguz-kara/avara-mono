'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { IconButton } from '@mui/material'
import Close from '@mui/icons-material/Close'

interface SnackbarOptions {
  variant?: 'default' | 'error' | 'warning' | 'success'
  message: string
  position?:
    | 'center-top'
    | 'left-bottom'
    | 'center-bottom'
    | 'right-bottom'
    | 'left-top'
    | 'right-top'
}

type SnackbarContextType = {
  snackbar: (options: SnackbarOptions) => void
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
)

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<SnackbarOptions>({
    message: '',
    variant: 'default',
    position: 'center-top',
  })

  const snackbar = (opts: SnackbarOptions) => {
    setOptions({ ...options, ...opts })
    setOpen(true)
  }

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const getAnchorOrigin = () => {
    switch (options.position) {
      case 'center-top':
        return { vertical: 'top', horizontal: 'center' }
      case 'left-bottom':
        return { vertical: 'bottom', horizontal: 'left' }
      case 'center-bottom':
        return { vertical: 'bottom', horizontal: 'center' }
      case 'right-bottom':
        return { vertical: 'bottom', horizontal: 'right' }
      case 'left-top':
        return { vertical: 'top', horizontal: 'left' }
      case 'right-top':
        return { vertical: 'top', horizontal: 'right' }
      default:
        return { vertical: 'top', horizontal: 'center' }
    }
  }

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <Close fontSize="small" />
      </IconButton>
    </React.Fragment>
  )

  return (
    <SnackbarContext.Provider value={{ snackbar }}>
      {children}
      {options.variant === 'default' ? (
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={getAnchorOrigin() as any}
          action={action}
          message={options.message}
        />
      ) : (
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={getAnchorOrigin() as any}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleClose}
            severity={options.variant}
          >
            {options.message}
          </MuiAlert>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  )
}
