'use client'
import Box from '@avc/components/ui/box'
import { DataGrid, GridColDef } from '@avc/components/ui/data-grid'
import { turkishLocaleText } from '../../locale/turkish-locale-text'
import TextField from '@avc/components/ui/text-field'
import { Facet, MutationDeleteFacetListArgs } from '@avc/generated/graphql'
import Stack from '@avc/components/ui/stack'
import Typography from '@avc/components/ui/typography'
import AddCircleOutlineTwoToneIcon from '@mui/icons-material/AddCircleOutlineTwoTone'
import Button from '@avc/components/ui/button'
import Link from '@avc/components/ui/link'
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone'
import {
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  Snackbar,
  IconButton,
  CardActions,
  CardContent,
  Card,
} from '@mui/material'
import React, { useState } from 'react'
import { useMutation } from '@avc/lib/hooks/use-mutation'
import { DELETE_FACET_LIST } from '@avc/graphql/mutations'
import CloseIcon from '@mui/icons-material/Close'
import FormLayout from '@avc/components/layout/form-layout'

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Nitelik Adı',
    width: 250,
    renderCell: (params) => (
      <Link href={`/katalog/nitelikler/${params.row.id}`}>
        <Typography variant="caption" sx={{ color: 'secondary.main', p: 0 }}>
          {params.row.name}
        </Typography>
      </Link>
    ),
  },
  {
    field: 'code',
    headerName: 'Kod',
    width: 90,
  },
  {
    field: 'values',
    headerName: 'Nitelik Değerleri',
    sortable: false,
    width: 320,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        {params.row.values?.map((value: any) => (
          <Chip label={value.name} color="primary" key={value.id}>
            {value.name}
          </Chip>
        ))}
      </Stack>
    ),
  },
]

const paginationModel = { page: 0, pageSize: 5 }

export default function FacetListing({
  initialFacets,
}: {
  initialFacets: Facet[]
}) {
  const [facets, setFacets] = useState<Facet[]>(initialFacets)
  const [successToastMessage, setSuccessToastMessage] = useState<string | null>(
    null
  )
  const [deleteFacetList, { loading }] = useMutation<
    { deleteFacetList: boolean },
    MutationDeleteFacetListArgs
  >(DELETE_FACET_LIST)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const handleDeleteClick = () => {
    setOpenDialog(true)
  }

  const handleConfirmDelete = async () => {
    const result = await deleteFacetList({ variables: { ids: selectedRows } })
    if (result.data?.deleteFacetList) {
      setSuccessToastMessage('Nitelikler başarıyla silindi')
      setFacets(facets.filter((facet) => !selectedRows.includes(facet.id)))
      setSelectedRows([])
    }
    setOpenDialog(false)
  }

  const rows = facets?.map((facet) => ({
    id: facet.id,
    name: facet.name,
    code: facet.code,
    values: facet.values,
  }))

  const header = (
    <Box px={4}>
      <Typography variant="h6">Nitelikler</Typography>
      <Typography variant="subtitle1" color="textDisabled">
        Niteliklerinizi listeleyin
      </Typography>
    </Box>
  )

  const leftSide = (
    <Box>
      <Box sx={{ px: 4, pb: 4 }}>
        <Stack direction="row" sx={{ mb: 2 }} gap={2}>
          <Box>
            <TextField
              slotProps={{
                input: {
                  startAdornment: <SearchTwoToneIcon sx={{ mr: 1 }} />,
                },
              }}
              placeholder="Nitelik adına göre filtrele"
              size="small"
            />
          </Box>
          <Box>
            <Button
              variant="outlined"
              color="error"
              size="small"
              sx={{
                textTransform: 'none',
                display: selectedRows.length === 0 ? 'none' : 'block',
              }}
              onClick={handleDeleteClick}
            >
              {selectedRows.length} adet {` `}
              Seçili kayıtları sil
            </Button>
          </Box>
        </Stack>
        <DataGrid
          localeText={turkishLocaleText}
          columns={columns}
          rows={rows}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            borderRadius: 2,
            border: 0,
            '& .MuiDataGrid-columnHeader': { backgroundColor: '#252a2e' },
            '& .MuiDataGrid-filler': { backgroundColor: '#252a2e' },
            '& .MuiDataGrid-row': {
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            },
            '& .MuiDataGrid-main': {
              borderRadius: 2,
              border: '1px solid #212121',
            },
          }}
          onRowSelectionModelChange={(newSelection) => {
            setSelectedRows(newSelection as string[])
          }}
        />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Silme İşlemini Onayla</DialogTitle>
        <DialogContent>
          <Typography>
            Seçili nitelikleri silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="text"
            color="inherit"
          >
            İptal
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )

  const rightSide = (
    <Card sx={{ p: 0 }}>
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
          <Typography variant="subtitle1">Aksiyonlar</Typography>
        </Box>
      </CardContent>

      <CardActions
        sx={{
          p: 2,
        }}
      >
        <Box>
          <Link href="/katalog/nitelikler/yeni">
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineTwoToneIcon />}
            >
              Nitelik Ekle
            </Button>
          </Link>
        </Box>
      </CardActions>
    </Card>
  )

  return (
    <FormLayout
      title={header}
      leftContent={leftSide}
      rightContent={rightSide}
    />
  )
}
