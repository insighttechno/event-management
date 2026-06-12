import { useRef, useState } from 'react'
import { Film, Image as ImageIcon, Link2, Plus, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { galleries as initialGalleries } from '@/data/finance'
import { formatFileSize, nextSequentialId } from '@/lib/utils'

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
  { name: 'videoCount', label: 'Video count', type: 'number', min: 0 },
  { name: 'status', label: 'Status', type: 'select', options: galleryStatuses },
  { name: 'deliveredDate', label: 'Delivered date', type: 'date' },
]

const emptyGallery = {
  title: '',
  client: '',
  photographer: '',
  photoCount: '',
  videoCount: '',
  status: 'In Progress',
  deliveredDate: '',
}

function mediaLabel(gallery) {
  const photos = gallery.photoCount ?? 0
  const videos = gallery.videoCount ?? 0
  if (!photos && !videos) return 'No media yet'
  const parts = []
  if (photos) parts.push(`${photos} photo${photos !== 1 ? 's' : ''}`)
  if (videos) parts.push(`${videos} video${videos !== 1 ? 's' : ''}`)
  return parts.join(' · ')
}

export default function Gallery() {
  const [galleries, setGalleries] = useState(initialGalleries)
  const [formOpen, setFormOpen] = useState(false)
  const [editingGallery, setEditingGallery] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [uploadTarget, setUploadTarget] = useState(null)

  const handleUpload = (files) => {
    const videos = files.filter((file) => file.type.startsWith('video')).length
    const photos = files.length - videos
    setGalleries((prev) =>
      prev.map((gallery) =>
        gallery.id === uploadTarget.id
          ? {
              ...gallery,
              photoCount: (gallery.photoCount ?? 0) + photos,
              videoCount: (gallery.videoCount ?? 0) + videos,
            }
          : gallery
      )
    )
    const parts = []
    if (photos) parts.push(`${photos} photo${photos !== 1 ? 's' : ''}`)
    if (videos) parts.push(`${videos} video${videos !== 1 ? 's' : ''}`)
    toast.success(`${parts.join(' & ')} uploaded to "${uploadTarget.title}".`)
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

    payload.videoCount = Number(values.videoCount) || 0

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
                  {gallery.client} · {gallery.photographer} · {mediaLabel(gallery)}
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

      <UploadMediaDialog
        gallery={uploadTarget}
        onOpenChange={(open) => !open && setUploadTarget(null)}
        onUpload={handleUpload}
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

function UploadMediaDialog({ gallery, onOpenChange, onUpload }) {
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)

  const close = () => {
    onOpenChange(false)
    setFiles([])
    setDragOver(false)
  }

  const addFiles = (fileList) => {
    const incoming = [...fileList].filter(
      (file) => file.type.startsWith('image') || file.type.startsWith('video')
    )
    if (!incoming.length) return
    setFiles((prev) => {
      const names = new Set(prev.map((file) => file.name))
      return [...prev, ...incoming.filter((file) => !names.has(file.name))]
    })
  }

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((file) => file.name !== name))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!files.length) return
    onUpload(files)
    close()
  }

  const photoCount = files.filter((file) => !file.type.startsWith('video')).length
  const videoCount = files.length - photoCount

  return (
    <Dialog open={!!gallery} onOpenChange={(value) => !value && close()}>
      <DialogContent className="sm:max-w-md">
        {gallery && (
          <>
            <DialogHeader>
              <DialogTitle>Upload Photos & Videos</DialogTitle>
              <DialogDescription>
                Add media to "{gallery.title}". (Demo: files are counted, not stored.)
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="contents">
              <div className="flex flex-col gap-4 py-1">
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(event) => {
                    addFiles(event.target.files)
                    event.target.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(event) => {
                    event.preventDefault()
                    setDragOver(false)
                    addFiles(event.dataTransfer.files)
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-border px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40',
                    dragOver && 'border-primary bg-primary/5'
                  )}
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <ImageIcon className="size-5" />
                    <Film className="size-5" />
                  </span>
                  <span className="text-sm font-medium">Click to browse photos & videos</span>
                  <span className="text-xs text-muted-foreground">
                    or drag & drop them here — JPG, PNG, MP4, MOV...
                  </span>
                </button>

                {files.length > 0 && (
                  <div className="flex max-h-44 flex-col gap-1.5 overflow-y-auto">
                    {files.map((file) => {
                      const isVideo = file.type.startsWith('video')
                      return (
                        <div
                          key={file.name}
                          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                        >
                          {isVideo ? (
                            <Film className="size-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                          <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
                            {isVideo ? 'Video' : 'Photo'}
                          </Badge>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(file.name)}
                            className="shrink-0 text-muted-foreground/60 hover:text-destructive"
                          >
                            <X className="size-4" />
                            <span className="sr-only">Remove {file.name}</span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!files.length} className="gap-1.5">
                  <Upload className="size-4" />
                  Upload
                  {files.length > 0 && (
                    <span className="text-xs opacity-80">
                      ({photoCount > 0 && `${photoCount} photo${photoCount !== 1 ? 's' : ''}`}
                      {photoCount > 0 && videoCount > 0 && ', '}
                      {videoCount > 0 && `${videoCount} video${videoCount !== 1 ? 's' : ''}`})
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
