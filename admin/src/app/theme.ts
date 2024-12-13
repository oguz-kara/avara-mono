'use client'
import { createTheme, PaletteMode } from '@mui/material/styles'

// Define colors for both modes
const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors
          background: {
            default: '#ffffff',
            paper: '#ffffff',
          },
          primary: {
            main: '#5D5FEF',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#fcd400',
            contrastText: '#000000',
          },
        }
      : {
          // Dark mode colors
          background: {
            default: '#202529',
            paper: '#1d2227',
          },
          primary: {
            main: '#fcd400',
            contrastText: '#181d22',
          },
          secondary: {
            main: '#5D5FEF',
            contrastText: '#fcd400',
          },
        }),
  },
  typography: {
    fontFamily: 'var(--font-geist-sans)',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          background: '#191e23',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: mode === 'light' ? '#ffffff' : '#1d2227',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'light' ? '#ffffff' : '#1d2227',
          boxShadow:
            mode === 'light'
              ? '0px 4px 6px -1px rgba(0,0,0,0.1)'
              : '0px 4px 6px -1px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: mode === 'light' ? '#ffffff' : '#181d22',
          border: '1px solid',
          borderColor: mode === 'light' ? '#e0e0e0' : '#212121',
        },
      },
    },
  },
})

// Create the theme with dark mode as default
const theme = createTheme(getDesignTokens('dark'))

export default theme
