import { ThemeProvider } from '@mui/material/styles'
import ReactQueryProvider from './react-query-provider'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import theme from '@avc/app/theme'
import { ApolloWrapper } from '@avc/lib/apollo/apollo-provider'
import { SnackbarProvider } from '@avc/context/snackbar-context'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'css' }}>
      <ThemeProvider theme={theme}>
        <ApolloWrapper>
          <SnackbarProvider>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </SnackbarProvider>
        </ApolloWrapper>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
