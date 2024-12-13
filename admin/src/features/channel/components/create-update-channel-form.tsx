'use client'
import React from 'react'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Breadcrumbs, Button, Stack, MenuItem } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@avc/components/ui/typography'
import FormLabel from '@avc/components/ui/label'
import TextField from '@avc/components/ui/text-field'
import Switch from '@avc/components/ui/switch'
import Card, { CardContent, CardActions } from '@avc/components/ui/card'
import FormLayout from '@avc/components/layout/form-layout'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSnackbar } from '@avc/context/snackbar-context'
import { useMutation } from '@avc/lib/hooks/use-mutation'
import { CREATE_CHANNEL, UPDATE_CHANNEL } from '@avc/graphql/mutations'
import { Channel, CreateChannelInput } from '@avc/generated/graphql'

enum ChannelType {
  RETAIL = 'RETAIL',
  B2B = 'B2B',
  MARKETPLACE = 'MARKETPLACE',
  LOCALE = 'LOCALE',
  OTHER = 'OTHER',
}

enum ChannelStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

const createChannelSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, 'Kanal adı zorunludur'),
  code: z.string().min(1, 'Kod zorunludur'),
  defaultLanguageCode: z.string().min(1, 'Varsayılan dil kodu zorunludur'),
  currencyCode: z.string().min(1, 'Para birimi kodu zorunludur'),
  isDefault: z.boolean().optional(),
  status: z.nativeEnum(ChannelStatus).optional().default(ChannelStatus.ACTIVE),
  type: z.nativeEnum(ChannelType).optional().default(ChannelType.OTHER),
})

type CreateChannelFormValues = z.infer<typeof createChannelSchema>

export default function CreateUpdateChannelForm({
  channel,
}: {
  channel?: Channel
}) {
  const { snackbar } = useSnackbar()
  const router = useRouter()
  const [createChannelMutation, { loading: createChannelLoading }] =
    useMutation(CREATE_CHANNEL)
  const [updateChannelMutation, { loading: updateChannelLoading }] =
    useMutation(UPDATE_CHANNEL)

  const formMethods = useForm<CreateChannelFormValues>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      id: channel?.id,
      name: channel?.name || '',
      code: channel?.code || '',
      defaultLanguageCode: channel?.defaultLanguageCode || '',
      currencyCode: channel?.currencyCode || '',
      isDefault: channel?.isDefault || false,
      status: (channel?.status as any) || ChannelStatus.ACTIVE,
      type: (channel?.type as any) || ChannelType.OTHER,
    },
  })

  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = formMethods

  const onSubmit = async (data: CreateChannelFormValues) => {
    if (Boolean(channel)) {
      const normalizedData = normalizeChannelFormToApiInput(data)
      const result = await updateChannelMutation({
        variables: { id: channel?.id, input: normalizedData },
      })

      if (result.data?.updateChannel) {
        snackbar({ message: 'Kanal güncellendi', variant: 'default' })
        router.push(`/kanallar`)
      } else {
        snackbar({
          message: 'Kanal güncellenirken bir hata oluştu',
          variant: 'error',
        })
      }
    } else {
      const normalizedData = normalizeChannelFormToApiInput(data)

      const result = await createChannelMutation({
        variables: { input: normalizedData },
      })
      const newChannel = result.data?.createChannel
      if (newChannel) {
        snackbar({
          message: 'Kanal oluşturuldu',
          variant: 'default',
        })
        router.push(`/kanallar/${newChannel.id}`)
      } else {
        snackbar({
          message: 'Kanal oluşturulurken bir hata oluştu',
          variant: 'error',
        })
      }
    }
  }

  const detailsForm = (
    <Stack direction="column" spacing={2} sx={{ px: 4 }}>
      <Box>
        <FormLabel sx={{ display: 'block' }}>Kanal Adı</FormLabel>
        <Typography variant="caption" color="textSecondary">
          Kanalınızı tanımlayan benzersiz bir isim
        </Typography>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              error={!!error}
              helperText={error?.message}
              placeholder="Örn: Ana Mağaza, B2B Kanalı"
              fullWidth
            />
          )}
        />
      </Box>

      <Box>
        <FormLabel sx={{ display: 'block' }}>Kod</FormLabel>
        <Typography variant="caption" color="textSecondary">
          Sistem içinde kullanılacak benzersiz kod
        </Typography>
        <Controller
          name="code"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              error={!!error}
              helperText={error?.message}
              placeholder="Örn: MAIN_STORE, B2B_CHANNEL"
              fullWidth
            />
          )}
        />
      </Box>

      <Box>
        <FormLabel sx={{ display: 'block' }}>Varsayılan Dil Kodu</FormLabel>
        <Typography variant="caption" color="textSecondary">
          ISO dil kodu (örn: tr-TR, en-US)
        </Typography>
        <Controller
          name="defaultLanguageCode"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              error={!!error}
              helperText={error?.message}
              placeholder="tr-TR"
              fullWidth
            />
          )}
        />
      </Box>

      <Box>
        <FormLabel sx={{ display: 'block' }}>Para Birimi Kodu</FormLabel>
        <Typography variant="caption" color="textSecondary">
          ISO para birimi kodu (örn: TRY, USD)
        </Typography>
        <Controller
          name="currencyCode"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              error={!!error}
              helperText={error?.message}
              placeholder="TRY"
              fullWidth
            />
          )}
        />
      </Box>

      <Box>
        <FormLabel sx={{ display: 'block' }}>Durum</FormLabel>
        <Typography variant="caption" color="textSecondary">
          Kanalın mevcut çalışma durumu
        </Typography>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <TextField select {...field} fullWidth>
              {Object.values(ChannelStatus).map((status) => (
                <MenuItem value={status} key={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Box>

      <Box>
        <FormLabel sx={{ display: 'block' }}>Kanal Tipi</FormLabel>
        <Typography variant="caption" color="textSecondary">
          Kanalın kullanım amacı
        </Typography>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <TextField select {...field} fullWidth>
              {Object.values(ChannelType).map((t) => (
                <MenuItem value={t} key={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Box>

      <Box>
        <FormLabel sx={{ display: 'block' }}>Varsayılan Kanal</FormLabel>
        <Typography variant="caption" color="textSecondary">
          Bu kanalı varsayılan olarak ayarla
        </Typography>
        <Controller
          name="isDefault"
          control={control}
          render={({ field }) => (
            <Switch
              {...field}
              checked={field.value || false}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
      </Box>
    </Stack>
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
        Kanal Oluştur
      </Typography>
      <Breadcrumbs sx={{ px: 4 }}>
        <Typography color="text.primary">Ayarlar</Typography>
        <Link href="/kanallar">
          <Typography color="text.primary">Kanallar</Typography>
        </Link>
        <Typography color="textDisabled">Yeni Kanal</Typography>
      </Breadcrumbs>
    </Box>
  )

  const rightContent = (
    <Card sx={{ p: 0 }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6">Kanal Oluştur</Typography>
        <Typography variant="body2">
          Kanal ayarlarını yapılandırın ve kaydedin
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        <Button
          disabled={!isDirty || createChannelLoading || updateChannelLoading}
          variant="contained"
          size="large"
          fullWidth
          type="submit"
        >
          <Typography
            variant="button"
            sx={{ textTransform: 'none' }}
            fontWeight="bold"
          >
            {createChannelLoading || updateChannelLoading
              ? 'Kaydediliyor...'
              : 'Kaydet'}
          </Typography>
        </Button>
      </CardActions>
    </Card>
  )

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormLayout
          title={header}
          leftContent={detailsForm}
          rightContent={rightContent}
        />
      </form>
    </FormProvider>
  )
}

function normalizeChannelFormToApiInput(
  channel: Zod.infer<typeof createChannelSchema>
): CreateChannelInput {
  return {
    name: channel.name,
    code: channel.code,
    defaultLanguageCode: channel.defaultLanguageCode,
    currencyCode: channel.currencyCode,
    isDefault: channel.isDefault,
    type: channel.type,
    status: channel.status,
  }
}
