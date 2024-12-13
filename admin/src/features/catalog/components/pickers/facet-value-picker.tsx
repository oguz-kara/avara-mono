import React from 'react'
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Facet } from '@avc/generated/graphql'

interface FacetValuePickerProps {
  facets: Facet[]
  selectedValues: string[]
  onSelectionChange: (selected: string[]) => void
}

const FacetValuePicker: React.FC<FacetValuePickerProps> = ({
  facets,
  selectedValues,
  onSelectionChange,
}) => {
  const handleFacetValueChange = (valueId: string) => {
    const currentIndex = selectedValues.indexOf(valueId)
    let newSelectedValues = [...selectedValues]

    if (currentIndex === -1) {
      newSelectedValues.push(valueId)
    } else {
      newSelectedValues.splice(currentIndex, 1)
    }

    onSelectionChange(newSelectedValues)
  }

  const renderFacetContent = () => (
    <>
      {facets.map((facet) => (
        <Accordion key={facet.id} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">
              {facet.name}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Autocomplete
              multiple
              options={facet.values || []}
              getOptionLabel={(option) => option.name}
              onChange={(event, newValue) => {
                const selectedIds = newValue.map((val) => val.id)
                const otherSelectedValues = selectedValues.filter(
                  (id) => !facet.values?.find((val: any) => val.id === id)
                )
                onSelectionChange([...otherSelectedValues, ...selectedIds])
              }}
              value={
                facet.values?.filter((val: any) =>
                  selectedValues.includes(val.id)
                ) || []
              }
              renderOption={(props, option, { selected }) => {
                const { key, ...otherProps } = props
                return (
                  <li key={key} {...otherProps}>
                    <Checkbox style={{ marginRight: 8 }} checked={selected} />
                    {option.name}
                  </li>
                )
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder={`Search ${facet.name}`}
                />
              )}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  )

  return <Box sx={{ width: '100%' }}>{renderFacetContent()}</Box>
}

export default FacetValuePicker
