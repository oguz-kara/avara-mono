import LibraryBooksTwoToneIcon from './components/icons/library-books-two-tone'
import SettingsTwoToneIcon from './components/icons/settings-two-tone'

export type NavbarItemType = {
  label: string
  route?: string
  icon?: React.ReactNode
  permission?: string[]
  children?: NavbarItemType[]
  external?: boolean
}

export const navbarItems: NavbarItemType[] = [
  {
    label: 'Katalog',
    permission: ['VIEW_CATALOG'],
    icon: <LibraryBooksTwoToneIcon />,
    children: [
      {
        label: 'Ürünler',
        route: '/katalog/urunler',
        permission: ['VIEW_PRODUCTS'],
      },
      {
        label: 'Nitelikler',
        route: '/katalog/nitelikler',
        permission: ['VIEW_FACETS'],
      },
      {
        label: 'Koleksiyonlar',
        route: '/katalog/koleksiyonlar',
        permission: ['VIEW_COLLECTIONS'],
      },
    ],
  },
  {
    label: 'Sistem',
    permission: ['VIEW_SYSTEM'],
    icon: <SettingsTwoToneIcon />,
    children: [
      {
        label: 'Kanallar',
        route: '/kanallar',
        permission: ['VIEW_CHANNELS'],
      },
    ],
  },
]
