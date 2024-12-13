import React, { useState } from 'react'
import { TextField, Typography, Box } from '@mui/material'

export const JsonEditor = ({
  value,
  onChange,
}: {
  value: any
  onChange: (value: any) => void
}) => {
  const [inputValue, setInputValue] = useState(JSON.stringify(value, null, 2))
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    try {
      if (newValue === '') {
        setError('')
        onChange(null)
        return
      }
      const parsedValue = JSON.parse(newValue)
      setError('')
      onChange(parsedValue)
    } catch (err) {
      setError('Geçersiz JSON formatı')
    }
  }

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        JSON Düzenleyici
      </Typography>
      <TextField
        value={inputValue}
        onChange={handleChange}
        error={!!error}
        helperText={error || 'JSON verilerinizi buraya düzenleyin'}
        multiline
        rows={10}
        fullWidth
        variant="outlined"
        sx={{ mt: 2 }}
      />
    </Box>
  )
}
