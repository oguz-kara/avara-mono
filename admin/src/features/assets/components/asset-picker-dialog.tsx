'use client'
import React, { useState } from 'react'
import {
  Card,
  CardActionArea,
  Typography,
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AssetModal from './asset-modal'
import Image from 'next/image'
import { Asset } from '../types'
import FileIcon from '@mui/icons-material/FilePresent'

export default function AssetPickerDialog({
  selectedAssets,
  onAssetsChange,
}: {
  selectedAssets: Asset[]
  onAssetsChange: (assets: Asset[]) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card
        sx={{
          height: 200,
          display: 'flex',
          border: '2px dashed #ccc',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
          },
          marginBottom: 2,
        }}
        onClick={() => setOpen(true)}
      >
        <CardActionArea sx={{ width: '100%', height: '100%' }}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CloudUploadIcon color="action" sx={{ fontSize: 48 }} />
            <Typography variant="subtitle1" color="textSecondary">
              Bir dosya yüklemek için tıklayın
            </Typography>
          </Box>
        </CardActionArea>
      </Card>
      {selectedAssets.length > 0 ? (
        <Box>
          <ImageList cols={5} rowHeight={164}>
            {selectedAssets.map((asset: Asset, index: number) => (
              <ImageListItem key={asset.id ?? index}>
                <Image
                  width={164}
                  height={164}
                  src={
                    asset.type === 'IMAGE'
                      ? asset.preview ?? '/images/document-placeholder.png'
                      : '/images/document-placeholder.png'
                  }
                  alt={asset.originalName}
                  loading="lazy"
                  style={{
                    objectFit: 'contain',
                    width: '164px',
                    height: '164px',
                  }}
                />
                )
                <ImageListItemBar
                  title={asset.originalName}
                  subtitle={asset.fileSize}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      ) : null}

      <AssetModal
        open={open}
        onClose={() => setOpen(false)}
        onChange={onAssetsChange}
        selectedAssets={selectedAssets}
        setSelectedAssets={onAssetsChange}
      />
    </>
  )
}
