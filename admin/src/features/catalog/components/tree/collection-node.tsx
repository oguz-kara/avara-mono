import React, { useState } from 'react'
import { Collection } from '../../types/collection'
import Link from '@avc/components/ui/link'
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  Box,
  Tooltip,
} from '@mui/material'
import { ExpandLess, ExpandMore, Edit, Delete } from '@mui/icons-material'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material'
interface ExtendedCollection extends Collection {
  fetchedChildren?: boolean
}

interface CollectionNodeProps {
  collection: ExtendedCollection
  level?: number
  onSelect: (id: string) => void
  selectedId: string | null
  onExpand: (id: string) => Promise<void>
  onDelete: (id: string) => void
}
const CollectionNode: React.FC<CollectionNodeProps> = ({
  collection,
  level = 0,
  onSelect,
  selectedId,
  onExpand,
  onDelete,
}) => {
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: collection.id })

  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: collection.id,
  })

  const hasChildren = collection.children && collection.children.length > 0
  const canExpand = hasChildren || !collection.fetchedChildren

  const handleExpandToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!open && !hasChildren && !collection.fetchedChildren) {
      // Fetch children if not already fetched
      await onExpand(collection.id)
    }
    setOpen(!open)
  }

  const handleSelectNode = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(collection.id)
  }

  const handleDelete = async () => {
    setDeleteDialogOpen(false)
    await onDelete(collection.id)
  }

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor:
      selectedId === collection.id ? 'action.selected' : 'transparent',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor:
        selectedId === collection.id ? 'action.selected' : 'action.hover',
    },
    cursor: 'pointer' as const,
  }

  return (
    <>
      <ListItem
        ref={(node) => {
          setDraggableNodeRef(node)
          setDroppableNodeRef(node)
        }}
        sx={{
          pl: level * 2,
          ...style,
          borderRadius: 1,
          transition: 'background-color 0.2s ease',
        }}
        onClick={handleSelectNode}
      >
        <Box
          {...attributes}
          {...listeners}
          sx={{
            cursor: 'grab',
            mr: 1,
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label="Sürükle"
        >
          <DragIndicatorIcon />
        </Box>

        {canExpand ? (
          <IconButton
            onClick={handleExpandToggle}
            size="small"
            sx={{
              mr: 1,
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            }}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label={open ? 'Daralt' : 'Genişlet'}
          >
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}

        <ListItemText
          primary={collection.name}
          secondary={collection.slug}
          primaryTypographyProps={{
            fontWeight: selectedId === collection.id ? 'bold' : 'normal',
          }}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(collection.id)
          }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Koleksiyonu düzenle">
            <Link href={`/katalog/koleksiyonlar/${collection.id}`}>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit />
              </IconButton>
            </Link>
          </Tooltip>
          <Tooltip title="Koleksiyonu sil">
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteDialogOpen(true)
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      </ListItem>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Koleksiyonu Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{collection.name}" koleksiyonunu silmek istediğinizden emin
            misiniz?
            {collection.children && collection.children.length > 0 && (
              <Typography color="error" sx={{ mt: 1 }}>
                Bu koleksiyonun alt koleksiyonları var. Silme işlemi tüm alt
                koleksiyonları da etkileyecektir.
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {collection.children && collection.children.length > 0 && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {collection.children.map((child) => (
              <CollectionNode
                key={child.id}
                collection={child as ExtendedCollection}
                level={level + 1}
                onSelect={onSelect}
                selectedId={selectedId}
                onExpand={onExpand}
                onDelete={onDelete}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  )
}

export default CollectionNode
