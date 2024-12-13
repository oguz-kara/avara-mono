import { Permission } from '@av/common/access-control'

export type NavbarItemType = {
  label: string
  route?: string
  permission?: string[]
  children?: NavbarItemType[]
  external?: boolean
}

export const fullNavbarItems = [
  {
    label: 'Katalog',
    permission: [Permission.READ_CATALOG_GLOBAL],
    children: [
      {
        label: 'Ürünler',
        route: '/katalog/urunler',
        permission: [Permission.READ_PRODUCT_GLOBAL],
      },
      {
        label: 'Nitelikler',
        route: '/katalog/nitelikler',
        permission: [Permission.READ_FACET_GLOBAL],
      },
      {
        label: 'Koleksiyonlar',
        route: '/katalog/koleksiyonlar',
        permission: [Permission.READ_COLLECTION_GLOBAL],
      },
    ],
  },
  {
    label: 'Sistem',
    permission: [Permission.READ_CHANNEL_GLOBAL],
    children: [
      {
        label: 'Kanallar',
        route: '/kanallar',
        permission: [Permission.READ_CHANNEL_GLOBAL],
      },
    ],
  },
]
