'use client'

interface ExtendedCollection extends Collection {
  fetchedChildren?: boolean
}

import React, { useEffect, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import CollectionNode from './collection-node'
import { GET_COLLECTIONS } from '@avc/graphql/queries'
import { Collection } from '../../types/collection'
import { useQuery } from '@avc/lib/hooks/use-query'
import FormLayout from '@avc/components/layout/form-layout'
import {
  Box,
  CardActions,
  CardContent,
  Card,
  Typography,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material'
import Link from 'next/link'
import AddCircleOutlineTwoToneIcon from '@mui/icons-material/AddCircleOutlineTwoTone'
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone'
import { useMutation } from '@avc/lib/hooks/use-mutation'
import {
  DELETE_COLLECTION,
  EDIT_PARENT_COLLECTION,
} from '@avc/graphql/mutations'
import { useSnackbar } from '@avc/context/snackbar-context'
import {
  FindCollectionsResponse,
  PaginationInput,
} from '@avc/generated/graphql'

const CollectionTree: React.FC<{
  onSelect: (id: string | null) => void
  selectedCollectionId: string | null
}> = ({ onSelect, selectedCollectionId }) => {
  const { snackbar } = useSnackbar()
  const { data, loading, error, refetch } = useQuery<
    { collections: FindCollectionsResponse },
    {
      parentId: string | null
      pagination?: PaginationInput
    }
  >(GET_COLLECTIONS, {
    variables: {
      parentId: null,
    },
  })
  const [treeData, setTreeData] = useState<ExtendedCollection[]>([])
  const sensors = useSensors(useSensor(PointerSensor))
  const [searchTerm, setSearchTerm] = useState('')
  const [editParentCollection] = useMutation(EDIT_PARENT_COLLECTION)
  const { setNodeRef: setRootRef } = useDroppable({ id: 'root' })
  const [deleteCollection, { loading: deletingCollection }] =
    useMutation(DELETE_COLLECTION)

  const filteredTreeData = filterTree(treeData, searchTerm)

  const fetchCollectionsByParentId = async (parentId: string) => {
    if (!parentId) return

    console.log({ parentId })

    const result = await refetch({
      parentId: parentId as any,
    })

    if (result.data?.collections.items) {
      const newItems = result.data.collections.items as ExtendedCollection[]
      // Merge the new items as children of parentId node
      const updatedTree = mergeSubTree(treeData, parentId, newItems)
      setTreeData(updatedTree)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      if (!over) {
        const activeId = String(active.id)
        const updatedTree = updateTreeStructure(treeData, activeId, null)
        setTreeData(updatedTree)
      }
      return
    }

    const activeId = String(active.id)
    const overId = String(over.id)
    const parentId = overId === 'root' ? null : overId
    const updatedTree = updateTreeStructure(treeData, activeId, parentId)
    setTreeData(updatedTree)

    const result = await editParentCollection({
      variables: {
        id: activeId,
        parentId: parentId,
      },
    })

    if (result.data?.editParentCollection) {
      snackbar({
        variant: 'default',
        message: 'Koleksiyon başarıyla güncellendi',
      })
    } else {
      snackbar({
        variant: 'error',
        message: 'Koleksiyon güncellenirken bir hata oluştu',
      })
    }
  }

  const handleSelectCollection = (id: string) => {
    if (selectedCollectionId === id) onSelect(null)
    else onSelect(id)
  }

  const handleExpandNode = async (id: string) => {
    const node = findNodeById(treeData, id)
    if (node && !node.fetchedChildren) {
      await fetchCollectionsByParentId(id)
    }
  }

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      const result = await deleteCollection({
        variables: { id: collectionId },
      })

      if (result.data?.deleteCollection) {
        // Remove the collection from the tree
        setTreeData((prevTree) =>
          removeCollectionFromTree(prevTree, collectionId)
        )

        // If the deleted collection was selected, clear the selection
        if (selectedCollectionId === collectionId) {
          onSelect(null)
        }

        snackbar({
          variant: 'success',
          message: 'Koleksiyon başarıyla silindi.',
        })
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
      snackbar({
        variant: 'error',
        message: 'Koleksiyon silinirken bir hata oluştu.',
      })
    }
  }

  function removeCollectionFromTree(
    tree: Collection[],
    collectionId: string
  ): Collection[] {
    return tree
      .filter((node) => node.id !== collectionId)
      .map((node) => {
        if (node.children) {
          return {
            ...node,
            children: removeCollectionFromTree(node.children, collectionId),
          }
        }
        return node
      })
  }

  useEffect(() => {
    if (data) {
      const tree = buildTree(data.collections.items as Collection[])
      setTreeData(tree as ExtendedCollection[])
    }
  }, [data])

  if (loading) return <Typography>Loading collections...</Typography>
  if (error)
    return <Typography color="error">Error loading collections</Typography>

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Koleksiyonlarda ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchTwoToneIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: 1 }}
        />
      </Box>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Box
          ref={setRootRef}
          sx={{
            minHeight: '200px',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            transition: 'border-color 0.2s ease',
            '&:hover': {
              borderColor: 'text.primary',
            },
            overflowY: 'auto',
            maxHeight: '70vh',
          }}
        >
          {filteredTreeData.length > 0 ? (
            filteredTreeData.map((collection) => (
              <CollectionNode
                key={collection.id}
                collection={collection}
                onSelect={handleSelectCollection}
                selectedId={selectedCollectionId}
                onExpand={handleExpandNode}
                onDelete={handleDeleteCollection}
              />
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', mt: 4 }}
            >
              Eşleşen koleksiyon bulunamadı.
            </Typography>
          )}
        </Box>
      </DndContext>
    </Box>
  )
}

function buildTree(collections: Collection[]): Collection[] {
  const map = new Map<string, Collection>()
  const roots: Collection[] = []

  collections.forEach((collection) => {
    map.set(collection.id, { ...collection, children: [] })
  })

  map.forEach((collection) => {
    if (collection.parentId) {
      const parent = map.get(collection.parentId)
      if (parent && parent.children) {
        parent.children.push(collection)
      }
    } else {
      roots.push(collection)
    }
  })

  return roots
}

function mergeSubTree(
  tree: ExtendedCollection[],
  parentId: string,
  newItems: ExtendedCollection[]
): ExtendedCollection[] {
  const newTree = JSON.parse(JSON.stringify(tree)) as ExtendedCollection[]

  function insertChildren(nodes: ExtendedCollection[]): boolean {
    for (const node of nodes) {
      if (node.id === parentId) {
        node.children = newItems.map((item) => ({
          ...item,
          children: item.children ?? [],
        }))
        node.fetchedChildren = true
        return true
      }
      if (node.children && node.children.length > 0) {
        const inserted = insertChildren(node.children as ExtendedCollection[])
        if (inserted) return true
      }
    }
    return false
  }

  insertChildren(newTree)
  return newTree
}

function filterTree(
  collections: Collection[],
  searchTerm: string
): Collection[] {
  if (!collections) return []

  return collections
    .map((collection) => {
      const match = collection.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const filteredChildren = filterTree(collection.children || [], searchTerm)

      if (match || filteredChildren.length > 0) {
        return { ...collection, children: filteredChildren } as Collection
      }
      return null
    })
    .filter((item): item is Collection => item !== null)
}

function findNodeById(
  tree: ExtendedCollection[],
  id: string
): ExtendedCollection | null {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

function updateTreeStructure(
  tree: Collection[],
  draggedId: string,
  newParentId: string | null
): Collection[] {
  const newTree = JSON.parse(JSON.stringify(tree)) as Collection[]

  function removeNode(nodes: Collection[], id: string): Collection | null {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (node.id === id) {
        nodes.splice(i, 1)
        return node
      } else if (node.children && node.children.length > 0) {
        const removedNode = removeNode(node.children, id)
        if (removedNode) return removedNode
      }
    }
    return null
  }

  function addNode(
    nodes: Collection[],
    parentId: string,
    child: Collection
  ): boolean {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (node.id === parentId) {
        node.children = node.children || []
        node.children.push(child)
        return true
      } else if (node.children && node.children.length > 0) {
        const added = addNode(node.children, parentId, child)
        if (added) return true
      }
    }
    return false
  }

  const draggedNode = removeNode(newTree, draggedId)
  if (!draggedNode) return newTree

  draggedNode.parentId = newParentId !== draggedId ? newParentId : null

  if (newParentId === draggedId) {
    // Prevent dropping into itself
    return newTree
  }

  if (!newParentId) {
    newTree.push(draggedNode)
  } else {
    addNode(newTree, newParentId, draggedNode)
  }

  return newTree
}

const rightContent = (selectedCollectionId: string | null) => (
  <Card sx={{ p: 0 }}>
    <CardContent sx={{ p: 0 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Aksiyonlar
        </Typography>
      </Box>
    </CardContent>

    <CardActions
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Link
          href={`/katalog/koleksiyonlar/yeni?parent=${
            selectedCollectionId ?? ''
          }`}
          style={{ textDecoration: 'none', width: '100%' }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineTwoToneIcon />}
          >
            Yeni Koleksiyon Ekle
          </Button>
        </Link>
      </Box>
    </CardActions>
  </Card>
)

function CollectionTreeLayout() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null)

  return (
    <FormLayout
      title="Koleksiyonlar"
      leftContent={
        <Box sx={{ px: 4 }}>
          <CollectionTree
            onSelect={setSelectedCollectionId}
            selectedCollectionId={selectedCollectionId}
          />
        </Box>
      }
      rightContent={rightContent(selectedCollectionId)}
    />
  )
}

export default CollectionTreeLayout
