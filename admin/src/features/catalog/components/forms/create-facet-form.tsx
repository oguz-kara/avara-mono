'use client'
import Link from 'next/link'
import { z } from 'zod'
import { useMutation } from '@avc/lib/hooks/use-mutation'
import { CREATE_FACET } from '@avc/graphql/mutations'
import { Facet, MutationCreateFacetArgs } from '@avc/generated/graphql'
import { Breadcrumbs, Button } from '@mui/material'
import React from 'react'
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Paper from '@avc/components/ui/paper'
import Typography from '@avc/components/ui/typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@avc/components/ui/text-field'
import Card, { CardContent, CardActions } from '@avc/components/ui/card'
import Switch from '@avc/components/ui/switch'
import { useRouter } from 'next/navigation'
import { useSnackbar } from '@avc/context/snackbar-context'
import FormLayout from '@avc/components/layout/form-layout'

const createFacetSchema = z.object({
  name: z.string().min(1, 'Nitelik adı zorunludur'),
  code: z.string().min(1, 'Kod zorunludur'),
  isPrivate: z.boolean().optional(),
})

type UpdateProductInput = z.infer<typeof createFacetSchema>

export default function CreateFacetForm() {
  const { snackbar } = useSnackbar()
  const router = useRouter()
  const [createFacet, { loading }] = useMutation<
    { createFacet: Facet },
    MutationCreateFacetArgs
  >(CREATE_FACET)

  const formMethods = useForm<UpdateProductInput>({
    resolver: zodResolver(createFacetSchema),
    defaultValues: {
      name: '',
      code: '',
      isPrivate: false,
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = formMethods

  const isPrivate = watch('isPrivate')

  const onSubmit = async (data: UpdateProductInput) => {
    try {
      // @ts-ignore
      const result = await createFacet({
        variables: {
          input: {
            name: data.name,
            code: data.code,
            isPrivate: data.isPrivate,
          },
        },
      })

      const createdFacet = result.data?.createFacet
      if (createdFacet) {
        snackbar({
          message: 'Nitelik oluşturuldu',
          variant: 'default',
        })
        router.push(`/katalog/nitelikler/${createdFacet.id}`)
      }
    } catch (error) {
      console.error('Error creating facet:', error)
    }
  }

  const leftContent = (
    <Box sx={{ display: 'flex', gap: 2, px: 4 }}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            placeholder="Nitelik adı buraya..."
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />
      <Controller
        name="code"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            placeholder="Kod"
            fullWidth
            error={!!errors.code}
            helperText={errors.code?.message}
          />
        )}
      />
    </Box>
  )

  const rightContent = (
    <Card sx={{ p: 0 }}>
      <React.Fragment>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'divider',
              p: 2,
            }}
          >
            <Box>
              <Typography variant="h6">Yayınla</Typography>
              <Typography variant="body2">Niteliği şimdi yayınlayın</Typography>
            </Box>
            <Box>
              <Controller
                name="isPrivate"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    {...field}
                    checked={field.value || false}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            </Box>
          </Box>
        </CardContent>
        <CardActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={loading}
          >
            <Typography
              variant="button"
              sx={{ textTransform: 'none' }}
              fontWeight="bold"
            >
              {loading
                ? 'Kaydediliyor...'
                : isPrivate
                ? 'Şimdi yayınla'
                : 'Kaydet'}
            </Typography>
          </Button>
        </CardActions>
      </React.Fragment>
    </Card>
  )

  const header = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Typography sx={{ px: 4 }} variant="h5" fontWeight="bold">
        Nitelik Oluştur
      </Typography>
      <Breadcrumbs sx={{ px: 4 }}>
        <Typography color="text.primary">Katalog</Typography>
        <Link href="/katalog/nitelikler">
          <Typography color="text.primary">Nitelikler</Typography>
        </Link>
        <Typography color="textDisabled">Yeni Nitelik Oluştur</Typography>
      </Breadcrumbs>
    </Box>
  )

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormLayout
          title={header}
          leftContent={leftContent}
          rightContent={rightContent}
        />
      </form>
    </FormProvider>
  )
}
