import React, { useRef } from 'react'
import {
  Modal,
  Box,
  Card,
  CardMedia,
  CardActionArea,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  Button,
  CardContent,
  TextField,
  IconButton,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import UploadIcon from '@mui/icons-material/Upload'
import Grid from '@mui/material/Grid2'
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone'
import { useQuery } from '@avc/hooks/use-query'
import CheckCircleTwoToneIcon from '@avc/components/icons/check-circle-two-tone'
import { useMutation } from '@avc/hooks/use-mutation'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import { supportedTypes } from '../config/supported-types'
import ArticleTwoToneIcon from '@mui/icons-material/ArticleTwoTone'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { Asset } from '../types'

const StyledModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '80%',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  outline: 'none',
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
}))

function AssetModal({
  open,
  onClose,
  onChange,
  selectedAssets,
  setSelectedAssets,
}: {
  open: boolean
  onClose: () => void
  onChange?: (assets: Asset[]) => void
  selectedAssets: Asset[]
  setSelectedAssets: (assets: Asset[]) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    data: assetsStore,
    isPending: isAssetStorePending,
    refetch,
  } = useQuery<{ items: Asset[] }>(['/assets/multiple'])
  const { mutateAsync: mutateAssets, isPending: isMutatingAssets } =
    useMutation<any>()

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      const uploadedAssets = await mutateAssets({
        path: '/assets/upload/multiple',
        options: { parseBody: false },
        body: formData,
      })

      if (uploadedAssets && Array.isArray(uploadedAssets)) {
        const newSelectedAssets = [...uploadedAssets, ...selectedAssets]
        setSelectedAssets(newSelectedAssets)
        onChange?.(newSelectedAssets)
        refetch()
      }
    }
  }

  const isAssetSelected = (asset: Asset) => {
    return selectedAssets.map((a) => a.id).includes(asset.id)
  }

  const handleAssetSelect = (asset: Asset) => {
    if (selectedAssets.length === 0) {
      const newAsset = { ...asset, featured: true }
      setSelectedAssets([newAsset])
      onChange?.([newAsset])
      return
    }

    const hasNoImages = !selectedAssets.some(
      (a) => a.type === 'IMAGE' || a.featured
    )

    if (hasNoImages && asset.type === 'IMAGE') {
      const newAsset = { ...asset, featured: true }
      setSelectedAssets([...selectedAssets, newAsset])
      onChange?.([...selectedAssets, newAsset])
      return
    }

    const newSelectedAssets = isAssetSelected(asset)
      ? selectedAssets.filter((a) => a.id !== asset.id)
      : [asset, ...selectedAssets]

    setSelectedAssets(newSelectedAssets)
    onChange?.(newSelectedAssets)
  }

  const handleDeleteSelected = async () => {
    const res = await mutateAssets({
      method: 'DELETE',
      path: '/assets/multiple',
      body: { ids: selectedAssets.map((a) => a.id) },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (Array.isArray(res)) setSelectedAssets([])
    refetch()
  }

  const toggleFeaturedAsset = (asset: Asset) => {
    setSelectedAssets(
      selectedAssets.map((a) =>
        a.id === asset.id ? { ...a, featured: !a.featured } : a
      )
    )
  }

  const getFeaturedAssetId = () => {
    return selectedAssets.find((a) => a.featured)?.id
  }

  return (
    <Modal open={open} onClose={onClose}>
      <StyledModalBox>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar sx={{ gap: 4 }}>
            <Typography variant="h6">Bir Dosya Seçin</Typography>
            <TextField
              sx={{ flexGrow: 1 }}
              slotProps={{
                input: {
                  startAdornment: <SearchTwoToneIcon sx={{ mr: 1 }} />,
                },
              }}
              placeholder="Dosya adına göre filtrele"
              size="small"
            />
            {selectedAssets?.length > 0 && (
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={handleDeleteSelected}
              >
                Seçilenleri Sil ({selectedAssets?.length})
              </Button>
            )}
            <input
              type="file"
              multiple
              accept={Object.values(supportedTypes).flat().join(',')}
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              startIcon={<UploadIcon />}
              color="primary"
              onClick={handleUploadClick}
            >
              Yükle
            </Button>
            <IconButton edge="end" onClick={onClose} sx={{ ml: 2 }}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
          {isAssetStorePending || isMutatingAssets ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {assetsStore?.items?.map((asset: Asset) => (
                <Grid
                  key={asset.id}
                  size={2}
                  sx={{
                    gridAutoRows: '1fr',
                  }}
                >
                  <Card>
                    <Box sx={{ position: 'relative' }}>
                      {asset.type === 'IMAGE' && (
                        <IconButton
                          onClick={(e) => {
                            toggleFeaturedAsset(asset)
                          }}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            zIndex: 1,
                          }}
                        >
                          {getFeaturedAssetId() === asset.id ? (
                            <StarIcon color="primary" />
                          ) : (
                            <StarBorderIcon />
                          )}
                        </IconButton>
                      )}
                      <CardActionArea
                        onClick={() => handleAssetSelect(asset)}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="140"
                          image={
                            asset.type === 'IMAGE'
                              ? asset.preview ??
                                '/images/document-placeholder.png'
                              : '/images/document-placeholder.png'
                          }
                          alt={`Asset ${asset.id}`}
                        />
                        {isAssetSelected(asset) && (
                          <CheckCircleTwoToneIcon
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              color: 'primary.main',
                            }}
                          />
                        )}
                      </CardActionArea>
                    </Box>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        {asset.originalName}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </StyledModalBox>
    </Modal>
  )
}

export default AssetModal
