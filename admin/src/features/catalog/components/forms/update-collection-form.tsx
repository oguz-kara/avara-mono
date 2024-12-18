'use client'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { seoMetadataSchema } from '@avc/features/seo/schema/seo-metadata.schema'
import {
  MenuButtonBold,
  MenuDivider,
  MenuSelectHeading,
  MenuControlsContainer,
  RichTextEditor,
  MenuButtonItalic,
  RichTextEditorRef,
} from 'mui-tiptap'
import { StarterKit } from '@tiptap/starter-kit'
import Link from '@avc/components/ui/link'
import React, { useRef, useState } from 'react'
import {
  useForm,
  Controller,
  useFieldArray,
  FormProvider,
} from 'react-hook-form'
import {
  TextField,
  Switch,
  Button,
  Box,
  FormControlLabel,
  Typography,
  Autocomplete,
  Checkbox,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  FormControl,
  CardContent,
  Card,
  CardActions,
  Tooltip,
  CircularProgress,
  Breadcrumbs,
  FormLabel,
  Stack,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { Collection } from '@avc/generated/graphql'
import InfoIcon from '@mui/icons-material/Info'
import FormLayout from '@avc/components/layout/form-layout'
import { SEARCH_FACET_VALUES, SEARCH_PRODUCTS } from '@avc/graphql/queries'
import { useQuery } from '@avc/lib/hooks/use-query'
import { useMutation } from '@avc/lib/hooks/use-mutation'
import { UPDATE_COLLECTION } from '@avc/graphql/mutations'
import { useSnackbar } from '@avc/context/snackbar-context'
import AssetPickerDialog from '@avc/features/assets/components/asset-picker-dialog'
import { SeoMetadataForm } from '@avc/features/seo/components/seo-metadata-form'
import FormTabs from '@avc/components/common/form-tabs'
import FormHeader from '@avc/components/common/typography/form-header'
import { useRouter } from 'next/navigation'

// Define the rule schema
const ruleSchema = z.object({
  id: z.string().optional(),
  code: z.string(),
  args: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
  summary: z.string().optional(),
})

// Define the collection form schema
const updateCollectionSchema = z.object({
  name: z.string().min(1, 'Koleksiyon adı zorunludur'),
  slug: z.string().min(1, 'Slug zorunludur'),
  description: z.string().optional(),
  isDynamic: z.boolean(),
  isPrivate: z.boolean(),
  products: z.array(z.any()).optional(),
  rules: z.array(ruleSchema).optional(),
  assets: z.array(z.any()).optional(),
  seoMetadata: seoMetadataSchema,
})

type UpdateCollectionFormValues = z.infer<typeof updateCollectionSchema>

interface RuleValues {
  operator?: string
  term?: string
  combineWithAnd?: boolean
  containsAny?: boolean
  facetValueIds?: string[]
}

export default function UpdateCollectionForm({
  collection,
}: {
  collection: Collection
}) {
  const router = useRouter()
  const { snackbar } = useSnackbar()
  const [productTerm, setProductTerm] = useState('')
  const [facetValueTerm, setFacetValueTerm] = useState('')
  const rteRef = useRef<RichTextEditorRef>(null)

  const assets = collection.featuredAsset
    ? [
        { ...collection.featuredAsset, featured: true },
        ...(collection.documents ?? []),
      ]
    : collection.documents

  const formMethods = useForm<UpdateCollectionFormValues>({
    resolver: zodResolver(updateCollectionSchema),
    defaultValues: {
      name: collection.name,
      slug: collection.slug || '',
      description: collection.description || '',
      isDynamic: collection.isDynamic,
      isPrivate: collection.isPrivate,
      products: collection.products || [],
      rules: collection.rules || [],
      assets: assets as any,
      seoMetadata: collection.seoMetadata || {},
    },
  })

  const { data: productsData, loading: isProductsLoading } = useQuery(
    SEARCH_PRODUCTS,
    {
      variables: {
        query: productTerm,
      },
    }
  )

  const { data: facetValuesData, loading: isFacetValuesLoading } = useQuery(
    SEARCH_FACET_VALUES,
    {
      variables: {
        query: facetValueTerm,
      },
    }
  )

  const [updateCollection, { loading: isUpdatingCollection }] =
    useMutation(UPDATE_COLLECTION)

  const updateCollectionMutation = async (data: any) => {
    const result = await updateCollection({
      variables: { id: collection.id, input: data },
    })

    const updatedCollection = result.data?.updateCollection

    if (updatedCollection) {
      snackbar({
        variant: 'default',
        message: 'Koleksiyon başarıyla güncellendi',
      })
      router.push(`/katalog/koleksiyonlar`)
    }
  }

  const products = productsData?.searchProducts.items || []
  const facetValues = facetValuesData?.searchFacetValues.items || []

  const { control, handleSubmit, watch, formState } = formMethods
  const { errors, isDirty } = formState

  const isDynamic = watch('isDynamic')
  const values = watch()

  const [openRuleDialog, setOpenRuleDialog] = useState(false)
  const [ruleType, setRuleType] = useState('')
  const [ruleValues, setRuleValues] = useState<RuleValues>({})

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rules',
  })

  const onSubmit = async (data: any) => {
    const input: any = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      isDynamic: data.isDynamic,
      isPrivate: data.isPrivate,
      seoMetadata: data.seoMetadata,
    }

    if (data.isDynamic) {
      input.rules = data.rules.map((rule: any) => ({
        code: rule.code,
        args: rule.args.map((arg: any) => ({
          name: arg.name,
          value: arg.value,
        })),
      }))
    } else {
      input.productIds = data.products.map((product: any) => product.id)
    }

    input.featuredAssetId = data.assets.find((a: any) => a.featured)?.id
    input.documentIds = data.assets
      .filter((a: any) => a.type === 'DOCUMENT')
      .map((a: any) => a.id)

    try {
      await updateCollectionMutation(input)
    } catch (error) {
      console.log({ error })
    }
  }

  const detailsForm = (
    <Stack sx={{ flex: 5, gap: 4, px: 4 }}>
      <FormHeader
        title="Koleksiyon Detayları"
        tooltip="Koleksiyon için temel bilgileri buradan düzenleyebilirsiniz"
      />
      <Box>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value || ''}
              label="İsim"
              required
              error={!!errors.name}
              helperText={errors.name?.message && 'İsim gerekli'}
              fullWidth
            />
          )}
        />
      </Box>

      <Box>
        <Controller
          name="slug"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value || ''}
              label="Slug"
              error={!!errors.slug}
              fullWidth
            />
          )}
        />
      </Box>

      <Box>
        <FormLabel sx={{ display: 'block' }}>Koleksiyon Açıklaması</FormLabel>
        <Typography variant="caption" color="textSecondary">
          Bu koleksiyon için kısa bir açıklama yazın
        </Typography>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              ref={rteRef}
              extensions={[StarterKit]}
              content={field.value || ''}
              onUpdate={({ editor }) => {
                field.onChange(editor.getHTML())
              }}
              renderControls={() => (
                <MenuControlsContainer>
                  <MenuSelectHeading />
                  <MenuDivider />
                  <MenuButtonBold />
                  <MenuButtonItalic />
                </MenuControlsContainer>
              )}
              editorProps={{
                attributes: {
                  style: 'height: 200px; overflow-y: auto;',
                },
              }}
            />
          )}
        />
      </Box>

      <Box>
        <Controller
          name="assets"
          control={control}
          render={({ field }) => (
            <AssetPickerDialog
              selectedAssets={field.value || []}
              onAssetsChange={field.onChange}
            />
          )}
        />
      </Box>
    </Stack>
  )

  const seoMetadataForm = <SeoMetadataForm isProduct={false} />

  const tabs = [
    { label: 'Koleksiyon Detayları', node: detailsForm },
    { label: 'SEO', node: seoMetadataForm },
  ]

  const sideContent = (
    <Card sx={{ p: 2, flex: 1 }}>
      <React.Fragment>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 2,
            }}
          >
            <Box>
              <Typography variant="h6">Gizli</Typography>
              <Typography variant="body2">Koleksiyonu gizli tutun</Typography>
            </Box>
            <Box>
              <Controller
                name="isPrivate"
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
          </Box>
          {isDynamic ? (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Dinamik Kurallar
              </Typography>

              {fields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    position: 'relative',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => remove(index)}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {field.code === 'PRODUCT_NAME_FILTER'
                      ? 'Ürün Adı Filtresi'
                      : 'Nitelik Değeri Filtresi'}
                  </Typography>
                  <Typography variant="body2">{field.summary}</Typography>
                </Box>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setRuleType('')
                  setRuleValues({})
                  setOpenRuleDialog(true)
                }}
              >
                Kural Ekle
              </Button>

              <Dialog
                open={openRuleDialog}
                onClose={() => setOpenRuleDialog(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>Kural Ekle</DialogTitle>
                <DialogContent>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <Select
                      value={ruleType}
                      onChange={(e) => setRuleType(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Kural Tipi Seçin
                      </MenuItem>
                      <MenuItem value="PRODUCT_NAME_FILTER">
                        Ürün Adı Filtresi
                      </MenuItem>
                      <MenuItem value="FACET_VALUE_FILTER">
                        Nitelik Değeri Filtresi
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {ruleType === 'PRODUCT_NAME_FILTER' && (
                    <>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <Select
                          value={ruleValues.operator || 'contains'}
                          onChange={(e) =>
                            setRuleValues({
                              ...ruleValues,
                              operator: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="contains">İçerir</MenuItem>
                          <MenuItem value="startsWith">İle Başlar</MenuItem>
                          <MenuItem value="endsWith">İle Biter</MenuItem>
                          <MenuItem value="equals">Eşittir</MenuItem>
                        </Select>
                        <Typography variant="caption">
                          Operatör, ürün adlarının nasıl eşleştirileceğini
                          belirler.
                        </Typography>
                      </FormControl>

                      <TextField
                        label="Terim"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={ruleValues.term || ''}
                        onChange={(e) =>
                          setRuleValues({
                            ...ruleValues,
                            term: e.target.value,
                          })
                        }
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ruleValues.combineWithAnd || false}
                            onChange={(e) =>
                              setRuleValues({
                                ...ruleValues,
                                combineWithAnd: e.target.checked,
                              })
                            }
                          />
                        }
                        label="VE ile Birleştir"
                      />
                    </>
                  )}

                  {ruleType === 'FACET_VALUE_FILTER' && (
                    <>
                      <Autocomplete
                        onInputChange={(_, value) => setFacetValueTerm(value)}
                        inputValue={facetValueTerm}
                        loading={isFacetValuesLoading}
                        loadingText="Nitelik Değerleri yükleniyor..."
                        multiple
                        options={facetValues || []}
                        getOptionLabel={(option: any) => option.name}
                        onChange={(event, newValue) =>
                          setRuleValues({
                            ...ruleValues,
                            facetValueIds: newValue.map((item: any) => item.id),
                          })
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Nitelik Değerleri"
                            placeholder="Nitelik Değerleri Seçin"
                            sx={{ mb: 2 }}
                          />
                        )}
                      />
                      <Typography variant="caption" sx={{ mb: 2 }}>
                        Nitelik değerleri, ürünleri belirli niteliklere göre
                        daraltır.
                      </Typography>

                      <br />
                      <br />

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Bu seçeneği etkinleştirdiğinizde, ürünler seçilen nitelik değerlerinden en az birine sahipse koleksiyona dahil edilir.">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={ruleValues.containsAny || false}
                                onChange={(e) =>
                                  setRuleValues({
                                    ...ruleValues,
                                    containsAny: e.target.checked,
                                  })
                                }
                              />
                            }
                            label={
                              <Typography variant="caption">
                                En Az Bir Eşleşen Özelliği Dahil Et
                                <IconButton size="small">
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </Typography>
                            }
                          />
                        </Tooltip>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Bu seçeneği etkinleştirdiğinizde, bu kural diğer kurallarla 'VE' mantığıyla birleştirilir. Yani, ürünün koleksiyona dahil edilmesi için bu kuralın yanı sıra diğer kuralların da karşılanması gerekir.">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={ruleValues.combineWithAnd || false}
                                onChange={(e) =>
                                  setRuleValues({
                                    ...ruleValues,
                                    combineWithAnd: e.target.checked,
                                  })
                                }
                              />
                            }
                            label={
                              <Typography variant="caption">
                                Diğer Kurallarla Birlikte Uygula
                                <IconButton size="small">
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </Typography>
                            }
                          />
                        </Tooltip>
                      </Box>
                    </>
                  )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                  <Button onClick={() => setOpenRuleDialog(false)}>
                    İptal
                  </Button>
                  <Button
                    onClick={() => {
                      let newRule: any = {
                        code: ruleType,
                        args: [],
                        summary: '',
                      }

                      if (ruleType === 'PRODUCT_NAME_FILTER') {
                        newRule.args = [
                          {
                            name: 'operator',
                            value: ruleValues.operator || 'contains',
                          },
                          {
                            name: 'term',
                            value: ruleValues.term || '',
                          },
                          {
                            name: 'combineWithAnd',
                            value: ruleValues.combineWithAnd ? 'true' : 'false',
                          },
                        ]
                        newRule.summary = `İsim ${
                          ruleValues.operator || 'içerir'
                        }: ${ruleValues.term || ''}`
                      } else if (ruleType === 'FACET_VALUE_FILTER') {
                        newRule.args = [
                          {
                            name: 'facetValueIds',
                            value: JSON.stringify(
                              ruleValues.facetValueIds || []
                            ),
                          },
                          {
                            name: 'containsAny',
                            value: ruleValues.containsAny ? 'true' : 'false',
                          },
                          {
                            name: 'combineWithAnd',
                            value: ruleValues.combineWithAnd ? 'true' : 'false',
                          },
                        ]
                        newRule.summary = `Nitelik Değerleri: ${
                          (ruleValues.facetValueIds || []).length
                        } seçildi`
                      }

                      append(newRule)
                      setOpenRuleDialog(false)
                    }}
                    variant="contained"
                    disabled={!ruleType}
                  >
                    Kural Ekle
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          ) : (
            // Static Collection Configuration
            <Box sx={{ my: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Ürünleri Seç
              </Typography>
              <Controller
                name="products"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    disableCloseOnSelect={true}
                    getOptionDisabled={(option: any) =>
                      values.products?.some((p: any) => p.id === option.id) ??
                      false
                    }
                    onInputChange={(_, value) => setProductTerm(value)}
                    inputValue={productTerm}
                    loading={isProductsLoading}
                    loadingText="Ürünler yükleniyor..."
                    multiple
                    options={products || []}
                    getOptionLabel={(option: any) => option.name}
                    onChange={(_, data) => field.onChange(data)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Ürünler"
                        placeholder="Ürünleri Seçin"
                      />
                    )}
                  />
                )}
              />
            </Box>
          )}

          <Box sx={{ py: 2 }}>
            <FormControlLabel
              control={
                <Controller
                  name="isDynamic"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              }
              label="Dinamik mi?"
            />
          </Box>
        </CardContent>
        <CardActions sx={{ p: 0 }}>
          <Button
            disabled={!isDirty}
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            startIcon={
              isUpdatingCollection ? <CircularProgress size={20} /> : null
            }
          >
            <Typography
              variant="button"
              sx={{ textTransform: 'none' }}
              fontWeight="bold"
            >
              {isUpdatingCollection ? 'Güncelleniyor...' : 'Kaydet'}
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
        Koleksiyon Detayları
      </Typography>
      <Breadcrumbs sx={{ px: 4 }}>
        <Typography color="text.primary">Katalog</Typography>
        <Link href="/katalog/koleksiyonlar">
          <Typography color="text.primary">Koleksiyonlar</Typography>
        </Link>
        <Typography textTransform="uppercase" color="textDisabled">
          Detay | Güncelle
        </Typography>
      </Breadcrumbs>
    </Box>
  )

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormLayout
          title={header}
          leftContent={<FormTabs tabs={tabs} />}
          rightContent={sideContent}
        />
      </form>
    </FormProvider>
  )
}
