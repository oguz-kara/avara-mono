'use client'
import React from 'react'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Stack,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material'
import TextField from '@avc/components/ui/text-field'
import Card, { CardContent, CardActions } from '@avc/components/ui/card'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useMutation } from '@avc/lib/hooks/use-mutation'
import { useSnackbar } from '@avc/context/snackbar-context'
import { useRouter } from 'next/navigation'
import { AUTHENTICATE_USER } from '@avc/graphql/mutations'
import Link from 'next/link'
import cookies from 'js-cookie'
import RestorePlusLogo from '@avc/components/common/restoreplus-logo'
import { useUser } from '../context/use-user'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Must be a valid email'),
  password: z.string().min(3, 'Password must be at least 6 characters'),
})

type LoginFormInputs = z.infer<typeof loginSchema>

export default function AuthenticateUserForm() {
  const { fetchCurrentUser } = useUser()
  const router = useRouter()
  const { snackbar } = useSnackbar()
  const [loginMutation, { loading }] = useMutation(AUTHENTICATE_USER)
  const [showPassword, setShowPassword] = React.useState(false)

  const formMethods = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = formMethods

  // Handle form submission
  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const result = await loginMutation({
        variables: { input: data },
      })
      const token = result.data?.authenticateUser?.token
      if (token) {
        snackbar({
          message: 'Login successful!',
          variant: 'default',
        })
        router.refresh()
        router.push('/katalog/urunler')
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error: any) {
      snackbar({
        message: error.message || 'Login failed',
        variant: 'error',
      })
    }
  }

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword((show) => !show)
  }

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
  }

  return (
    <FormProvider {...formMethods}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
          padding: 2,
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%', p: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
              <RestorePlusLogo />
            </Box>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                {/* Email Field */}
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      variant="outlined"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      required
                      type="email"
                    />
                  )}
                />

                {/* Password Field */}
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      variant="outlined"
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      required
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Stack>
            </form>
          </CardContent>
          <CardActions
            sx={{
              justifyContent: 'space-between',
              flexDirection: 'column',
              alignItems: 'stretch',
              pt: 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Link href="/sifremi-unuttum">
                <Typography variant="body2">
                  Parolanızı mı unuttunuz?
                </Typography>
              </Link>
            </Box>
          </CardActions>
        </Card>
      </Box>
    </FormProvider>
  )
}
