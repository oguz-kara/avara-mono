'use client'
import Link from 'next/link'
import { useMutation } from '@avc/lib/hooks/use-mutation'
import {
  CREATE_FACET_VALUE,
  DELETE_FACET_VALUE,
  UPDATE_FACET,
} from '@avc/graphql/mutations'
import {
  Facet,
  MutationCreateFacetValueArgs,
  FacetValue,
  MutationUpdateFacetArgs,
  MutationDeleteFacetValueArgs,
} from '@avc/generated/graphql'
import {
  Button,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  InputAdornment,
  Typography,
  Box,
  Stack,
  TextField as MuiTextField,
  Breadcrumbs,
} from '@mui/material'
import React, { useState } from 'react'
import { Controller, useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Paper from '@avc/components/ui/paper'
import TextField from '@avc/components/ui/text-field'
import Card, { CardContent, CardActions } from '@avc/components/ui/card'
import Switch from '@avc/components/ui/switch'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import FormLayout from '@avc/components/layout/form-layout'

const updateFacetSchema = z.object({
  name: z.string().min(1, 'Nitelik adı zorunludur'),
  code: z.string().min(1, 'Kod zorunludur'),
  isPrivate: z.boolean().optional(),
  facetValues: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'Değer adı zorunludur'),
      code: z.string().min(1, 'Değer kodu zorunludur'),
      isDirty: z.boolean().optional(),
    })
  ),
})

type UpdateFacetInput = z.infer<typeof updateFacetSchema>

export default function UpdateFacetForm({
  initialValues,
}: {
  initialValues: Facet
}) {
  const [successToastMessage, setSuccessToastMessage] = useState<string | null>(
    null
  )
  const [updateFacet, { loading }] = useMutation<
    { updateFacet: Facet },
    MutationUpdateFacetArgs
  >(UPDATE_FACET)
  const [createFacetValue, { loading: createFacetValueLoading }] = useMutation<
    { createFacetValue: FacetValue },
    MutationCreateFacetValueArgs
  >(CREATE_FACET_VALUE)
  const [deleteFacetValue, { loading: deleteFacetValueLoading }] = useMutation<
    { deleteFacetValue: FacetValue },
    MutationDeleteFacetValueArgs
  >(DELETE_FACET_VALUE)

  const [openDialog, setOpenDialog] = useState(false)
  const [newFacetValue, setNewFacetValue] = useState({ name: '', code: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [facetValueToDeleteIndex, setFacetValueToDeleteIndex] = useState<
    number | null
  >(null)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateFacetInput>({
    resolver: zodResolver(updateFacetSchema),
    defaultValues: {
      name: initialValues.name,
      code: initialValues.code,
      isPrivate: initialValues.isPrivate,
      facetValues:
        initialValues.values?.map((value) => ({
          id: value.id,
          name: value.name,
          code: value.code,
        })) || [],
    },
  })

  const {
    fields: facetValuesFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'facetValues',
    keyName: '_id',
  })

  const isPrivate = watch('isPrivate')

  const onSubmit = async (data: UpdateFacetInput) => {
    try {
      const dirtyFacetValues = data.facetValues.filter((fv) => fv.isDirty)

      const result = await updateFacet({
        variables: {
          input: {
            id: initialValues.id,
            name: data.name,
            code: data.code,
            isPrivate: data.isPrivate,
            values: dirtyFacetValues
              .map(({ id, name, code }) => ({
                id: id as string,
                name,
                code,
              }))
              .filter((value) => value.id),
          },
        },
      })

      const updatedFacet = result.data?.updateFacet
      if (updatedFacet) setSuccessToastMessage('Nitelik güncellendi')
    } catch (error) {
      console.error('Error updating facet:', error)
    }
  }

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={() => setSuccessToastMessage(null)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  )

  const handleAddFacetValue = async () => {
    const result = await createFacetValue({
      variables: {
        input: {
          name: newFacetValue.name,
          code: newFacetValue.code,
          facetId: initialValues.id,
        },
      },
    })

    const createdFacetValue = result.data?.createFacetValue
    if (createdFacetValue) {
      append({
        id: createdFacetValue.id,
        name: createdFacetValue.name,
        code: createdFacetValue.code,
        isDirty: false,
      })
      setSuccessToastMessage('Nitelik değeri oluşturuldu')
      setNewFacetValue({ name: '', code: '' })
      setOpenDialog(false)
    }
  }

  const handleDeleteFacetValueClick = (index: number) => {
    setFacetValueToDeleteIndex(index)
    setDeleteDialogOpen(true)
  }

  const handleDeleteFacetValue = async () => {
    if (facetValueToDeleteIndex === null) return

    const facetValueToDelete = facetValuesFields[facetValueToDeleteIndex]

    try {
      const result = await deleteFacetValue({
        variables: {
          id: facetValueToDelete.id as string,
        },
      })

      if (result.data?.deleteFacetValue) {
        remove(facetValueToDeleteIndex)
        setSuccessToastMessage('Nitelik değeri silindi')
      }
    } catch (error) {
      console.error('Error deleting facet value:', error)
    }

    setDeleteDialogOpen(false)
    setFacetValueToDeleteIndex(null)
  }

  const filteredFacetValues = facetValuesFields.map((facetValue) => ({
    id: facetValue.id,
    name: facetValue.name,
    code: facetValue.code,
  }))

  const leftContent = (
    <>
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
      <Box sx={{ px: 4 }}>
        <Typography variant="h6" sx={{ mt: 4 }}>
          Nitelik Değerleri
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
          <TextField
            placeholder="Nitelik değerlerinde ara..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <List>
          {filteredFacetValues.length === 0 && (
            <ListItem sx={{ p: 0, pb: 4 }}>
              <Typography>Bu nitelik için henüz bir değer yok</Typography>
            </ListItem>
          )}
          {filteredFacetValues.map((facetValue, index) => (
            <ListItem
              key={facetValue.id ?? facetValue.name + index}
              sx={{
                p: 0,
                pb: 4,
              }}
              alignItems="flex-start"
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteFacetValueClick(index)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Controller
                  name={`facetValues.${index}.name` as const}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Değer Adı"
                      fullWidth
                      onChange={(e) => {
                        field.onChange(e)
                        setValue(`facetValues.${index}.isDirty`, true)
                      }}
                    />
                  )}
                />
                <Controller
                  name={`facetValues.${index}.code` as const}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Değer Kodu"
                      fullWidth
                      onChange={(e) => {
                        field.onChange(e)
                        setValue(`facetValues.${index}.isDirty`, true)
                      }}
                    />
                  )}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ px: 4 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Değer Ekle
        </Button>
      </Box>
    </>
  )

  const rightContent = (
    <Card sx={{ p: 0 }}>
      <>
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
                ? 'Güncelleniyor...'
                : !isPrivate
                ? 'Şimdi yayınla'
                : 'Kaydet'}
            </Typography>
          </Button>
        </CardActions>
      </>
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
        Nitelik Detay | Güncelle
      </Typography>
      <Breadcrumbs sx={{ px: 4 }}>
        <Typography color="text.primary">Katalog</Typography>
        <Link href="/katalog/nitelikler">
          <Typography color="text.primary">Nitelikler</Typography>
        </Link>
        <Typography color="textDisabled">Nitelik Detay | Güncelle</Typography>
      </Breadcrumbs>
    </Box>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormLayout
        title={header}
        leftContent={leftContent}
        rightContent={rightContent}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Değer Ekle</DialogTitle>
        <DialogContent>
          <Stack gap={2} direction="row">
            <MuiTextField
              placeholder="Değer Adı"
              value={newFacetValue.name}
              onChange={(e) =>
                setNewFacetValue({
                  ...newFacetValue,
                  name: e.target.value,
                })
              }
              fullWidth
            />
            <MuiTextField
              placeholder="Değer Kodu"
              value={newFacetValue.code}
              onChange={(e) =>
                setNewFacetValue({
                  ...newFacetValue,
                  code: e.target.value,
                })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            İptal
          </Button>
          <Button onClick={handleAddFacetValue} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setFacetValueToDeleteIndex(null)
        }}
      >
        <DialogTitle>Nitelik Değerini Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu nitelik değerini silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false)
              setFacetValueToDeleteIndex(null)
            }}
            color="inherit"
          >
            İptal
          </Button>
          <Button
            onClick={handleDeleteFacetValue}
            variant="contained"
            color="error"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!successToastMessage}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setSuccessToastMessage(null)}
        message={successToastMessage}
        action={action}
      />
    </form>
  )
}
