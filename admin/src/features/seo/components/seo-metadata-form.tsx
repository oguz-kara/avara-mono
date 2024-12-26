import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import {
  Box,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { JsonEditor } from '@avc/components/common/json-editor'
import FormHeader from '@avc/components/common/typography/form-header'

interface SeoMetadataFormProps {
  isProduct?: boolean
}

export function SeoMetadataForm({ isProduct = false }: SeoMetadataFormProps) {
  const { control } = useFormContext()
  const entityType = isProduct ? 'Ürün' : 'Koleksiyon'

  return (
    <Stack sx={{ px: 4, gap: 4 }}>
      <FormHeader
        title="SEO Ayarları"
        tooltip="Arama motoru optimizasyonu için gerekli meta verileri buradan düzenleyebilirsiniz"
      />

      <Controller
        name="seoMetadata.title"
        control={control}
        rules={{ required: 'Başlık zorunludur' }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            value={field.value || ''}
            label="Sayfa Başlığı"
            required
            error={!!fieldState.error}
            helperText={
              fieldState.error?.message ||
              `${entityType} için SEO başlığını girin (60-70 karakter önerilir)`
            }
            fullWidth
          />
        )}
      />

      {/* Description */}
      <Controller
        name="seoMetadata.description"
        control={control}
        rules={{ required: 'Açıklama zorunludur' }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            value={field.value || ''}
            label="Meta Açıklama"
            required
            error={!!fieldState.error}
            helperText={
              fieldState.error?.message ||
              'Arama sonuçlarında görünecek kısa açıklama (150-160 karakter önerilir)'
            }
            fullWidth
            multiline
            minRows={3}
          />
        )}
      />

      {/* Keywords */}
      <Controller
        name="seoMetadata.keywords"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value || ''}
            label="Anahtar Kelimeler"
            placeholder="Virgülle ayırarak yazın"
            helperText="Örnek: online alışveriş, indirim, kampanya"
            fullWidth
          />
        )}
      />

      {/* Canonical URL */}
      <Controller
        name="seoMetadata.canonicalUrl"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value || ''}
            label="Canonical URL"
            placeholder="https://example.com/sayfa"
            helperText="İçeriğin asıl kaynağını belirten URL"
            type="url"
            fullWidth
          />
        )}
      />
      <Box>
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Sosyal Medya Görünümü</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mb: 2, display: 'block' }}
            >
              Sosyal medyada paylaşıldığında nasıl görüneceğini özelleştirin
            </Typography>

            {/* OG Title */}
            <Controller
              name="seoMetadata.ogTitle"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ''}
                  label="Sosyal Medya Başlığı"
                  helperText="Facebook, Twitter gibi platformlarda görünecek başlık"
                  fullWidth
                  sx={{ mt: 2 }}
                />
              )}
            />

            {/* OG Description */}
            <Controller
              name="seoMetadata.ogDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ''}
                  label="Sosyal Medya Açıklaması"
                  helperText="Sosyal medya paylaşımlarında görünecek açıklama"
                  fullWidth
                  multiline
                  minRows={3}
                  sx={{ mt: 2 }}
                />
              )}
            />

            {/* OG Image */}
            <Controller
              name="seoMetadata.ogImage"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ''}
                  label="Sosyal Medya Görseli"
                  helperText="Paylaşımlarda kullanılacak görsel URL'i"
                  type="url"
                  fullWidth
                  sx={{ mt: 2 }}
                />
              )}
            />
          </AccordionDetails>
        </Accordion>

        {/* Advanced Settings */}
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Gelişmiş SEO Ayarları</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Robots */}
            <Controller
              name="seoMetadata.robots"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ''}
                  label="Robots Direktifleri"
                  placeholder="Örnek: index, follow"
                  helperText="Arama motoru botları için özel yönergeler"
                  fullWidth
                  sx={{ mt: 2 }}
                />
              )}
            />

            {/* Change Frequency */}
            <Controller
              name="seoMetadata.changefreq"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={{ mt: 3 }}>
                  <InputLabel>Güncelleme Sıklığı</InputLabel>
                  <Select {...field} label="Güncelleme Sıklığı">
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    <MenuItem value="always">Her Zaman</MenuItem>
                    <MenuItem value="hourly">Saatlik</MenuItem>
                    <MenuItem value="daily">Günlük</MenuItem>
                    <MenuItem value="weekly">Haftalık</MenuItem>
                    <MenuItem value="monthly">Aylık</MenuItem>
                    <MenuItem value="yearly">Yıllık</MenuItem>
                    <MenuItem value="never">Asla</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {/* Priority */}
            <Controller
              name="seoMetadata.priority"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ''}
                  label="Öncelik"
                  type="number"
                  slotProps={{
                    htmlInput: { min: 0, max: 1, step: 0.1 },
                  }}
                  helperText="Site haritası için öncelik değeri (0.0 - 1.0 arası)"
                  fullWidth
                  sx={{ mt: 2 }}
                />
              )}
            />

            {/* Hreflang */}
            <Controller
              name="seoMetadata.hreflang"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ''}
                  label="Dil ve Bölge"
                  placeholder="Örnek: tr-TR"
                  helperText="Sayfa içeriğinin dil ve bölge hedeflemesi"
                  fullWidth
                  sx={{ mt: 2 }}
                />
              )}
            />
          </AccordionDetails>
        </Accordion>
      </Box>
    </Stack>
  )
}
