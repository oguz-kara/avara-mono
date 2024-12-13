import React, { useState } from 'react'
import { Button, Dialog, DialogTitle, DialogContent } from '@mui/material'
import FacetValuePicker from './facet-value-picker'
import { Facet } from '@avc/generated/graphql'

export const FacetValuePickerDialog = ({
  facets,
  selectedFacetValues,
  onSelectionChange,
}: {
  facets: Facet[]
  selectedFacetValues: string[]
  onSelectionChange: (selected: string[]) => void
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div>
      <Button
        variant="outlined"
        onClick={handleOpenModal}
        fullWidth
        sx={{ textTransform: 'initial' }}
      >
        Nitelik Değerlerini Seç
      </Button>

      {selectedFacetValues.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <strong>Seçili Nitelik Değerleri:</strong>
          <ul>
            {selectedFacetValues.map((valueId) => {
              const facetValue = facets
                .flatMap((facet) => facet.values)
                .find((val) => val?.id === valueId)
              return facetValue ? (
                <li key={valueId}>{facetValue.name}</li>
              ) : null
            })}
          </ul>
        </div>
      )}

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nitelik Değerlerini Seç</DialogTitle>
        <DialogContent>
          <FacetValuePicker
            facets={facets || []}
            selectedValues={selectedFacetValues}
            onSelectionChange={onSelectionChange}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FacetValuePickerDialog
