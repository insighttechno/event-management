import { useState } from 'react'
import { Image as ImageIcon, Link2, Plus, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { EntityFormDialog } from '@/components/common/EntityFormDialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { RowActions } from '@/components/common/RowActions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { galleries as initialGalleries } from '@/data/finance'
import { nextSequentialId } from '@/lib/utils'

const statusVariant = {
  Delivered: 'secondary',
  Editing: 'outline',
  'In Progress': 'outline',
}

const galleryStatuses = ['In Progress', 'Editing', 'Delivered']

const galleryFields = [
  { name: 'title', label: 'Project title', span: 'full', required: true },
  { name: 'client', label: 'Client', span: 'full' },
  { name: 'photographer', label: 'Photographer' },
  { name: 'photoCount', label: 'Photo count', type: 'number', min: 0 },
  { name: 'status', label: 'Status', type: 'select', options: galleryStatuses },
  { name: 'deliveredDate', label: 'Delivered date', type: 'date' },
]

const emptyGallery = {
  title: '',
  client: '',
  photographer: '',
  photoCount: '',
  status: 'In Progress',
  deliveredDate: '',
}

export default function Gallery() {
  const [galleries, setGalleries] = useState(initialGalleries)
  const [formOpen, setFormOpen] = useState(false)
  const [editingGallery, setEditingGallery] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [uploadTarget, setUploadTarget] = useState(null)

  const handleUpload = (values) => {
    const count = Number(values.photoCount) || 0
    if (count <= 0) return
    setGalleries((prev) =>
      prev.map((gallery) =>
        gallery.id === uploadTarget.id
          ? { ...gallery, photoCount: gallery.photoCount + count }
          : gallery
      )
    )
    toast.success(`${count} photos uploaded to "${uploadTarget.title}".`)
  }

  const copyClientLink = async (gallery) => {
    const link = `https://gallery.familyaffairkeywest.com/${gallery.id.toLowerCase()}`
    try {
      await navigator.clipboard.writeText(link)
      toast.success(`Client access link copied for "${gallery.title}".`, { description: link })
    } catch {
      toast.info(link, { description: 'Copy this client access link manually.' })
    }
  }

  const openAddDialog = () => {
    setEditingGallery(null)
    setFormOpen(true)
  }

  const openEditDialog = (gallery) => {
    setEditingGallery(gallery)
    setFormOpen(true)
  }

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      photoCount: Number(values.photoCount) || 0,
      deliveredDate: values.deliveredDate || null,
    }

    if (editingGallery) {
      setGalleries((prev) =>
        prev.map((gallery) =>
          gallery.id === editingGallery.id ? { ...gallery, ...payload } : gallery
        )
      )
      toast.success(`"${payload.title}" updated.`)
    } else {
      const newGallery = {
        ...payload,
        id: nextSequentialId(galleries, 'G'),
      }
      setGalleries((prev) => [newGallery, ...prev])
      toast.success(`"${payload.title}" added.`)
    }
  }

  const handleDelete = () => {
    setGalleries((prev) => prev.filter((gallery) => gallery.id !== deleteTarget.id))
    toast.success(`"${deleteTarget.title}" deleted.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Photography & Gallery Management"
        description="Track gallery projects and delivery status for Senses At Play shoots."
        action={
          <Button onClick={openAddDialog} className="gap-1.5">
            <Plus className="size-4" />
            Add Project
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Gallery Projects</CardTitle>
          <CardDescription>{galleries.length} active or recent projects</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {galleries.map((gallery) => (
            <div
              key={gallery.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                <ImageIcon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-tight">{gallery.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {gallery.client} · {gallery.photographer} ·{' '}
                  {gallery.photoCount > 0 ? `${gallery.photoCount} photos` : 'No photos yet'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={statusVariant[gallery.status] ?? 'outline'}>
                  {gallery.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setUploadTarget(gallery)}
                >
                  <Upload className="size-3.5" />
                  Upload
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => copyClientLink(gallery)}
                >
                  <Link2 className="size-3.5" />
                  Client link
                </Button>
                <RowActions
                  onEdit={() => openEditDialog(gallery)}
                  onDelete={() => setDeleteTarget(gallery)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <EntityFormDialog
        open={!!uploadTarget}
        onOpenChange={(open) => !open && setUploadTarget(null)}
        title="Upload Photos"
        description={
          uploadTarget
            ? `Add photos to "${uploadTarget.title}". (Demo: no real files are uploaded.)`
            : ''
        }
        fields={[
          {
            name: 'photoCount',
            label: 'Number of photos',
            type: 'number',
            min: 1,
            required: true,
            span: 'full',
          },
        ]}
        defaultValues={{ photoCount: '' }}
        onSubmit={handleUpload}
        submitLabel="Upload"
      />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingGallery ? 'Edit Project' : 'Add Project'}
        description={
          editingGallery
            ? 'Update this gallery project and save your changes.'
            : 'Add a new gallery project.'
        }
        fields={galleryFields}
        defaultValues={editingGallery ?? emptyGallery}
        onSubmit={handleSubmit}
        submitLabel={editingGallery ? 'Save changes' : 'Add project'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this project?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed. This cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
      />
    </div>
  )
}
