export interface Collection {
  id: string
  name: string
  slug: string
  parentId: string | null
  children?: Collection[]
}
