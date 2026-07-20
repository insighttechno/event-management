import { useMemo, useRef, useState } from 'react'
import {
  Plus, Check, Image as ImageIcon, Film, FolderPlus, Upload,
  Folder, ArrowLeft, Trash2, X, Search, Download, MoreVertical, ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { galleries as initialGalleries } from '@/data/finance'
import { cn, formatDate } from '@/lib/utils'

const galleryStatuses = ['In Progress', 'Editing', 'Delivered']

const GALLERY_IMAGES = [
  '/images/gallery/g1.jpg', '/images/gallery/g2.jpg', '/images/gallery/g3.jpg',
  '/images/gallery/g4.jpg', '/images/gallery/g5.jpg', '/images/gallery/g6.jpg',
]

let seedCounter = 0
const seedPhotos = (prefix, count) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-seed-${seedCounter++}`,
    name: `${prefix.toLowerCase()}-${String(i + 1).padStart(3, '0')}.jpg`,
    src: GALLERY_IMAGES[(i + seedCounter) % GALLERY_IMAGES.length],
    kind: 'photo',
  }))

const makeFolder = (name, count) => ({ id: `fold-${name}-${seedCounter++}`, name, photos: seedPhotos(name, count) })

// Seed galleries with a Drive-like mix: some sub-folders + some loose photos.
const withPhotos = initialGalleries.map((g, gi) => {
  if (gi === 0) return { ...g, photos: seedPhotos(g.id, 4), folders: [makeFolder('Engagement Shoot', 6), makeFolder('Ceremony', 5)] }
  if (gi === 1) return { ...g, photos: seedPhotos(g.id, 9), folders: [] }
  return { ...g, photos: seedPhotos(g.id, 4), folders: [makeFolder('Reception', 5)] }
})

const statusTone = (s) =>
  s === 'Delivered' ? 'bg-emerald-500/15 text-emerald-700'
    : s === 'Editing' ? 'bg-primary/15 text-primary'
      : 'bg-amber-500/15 text-amber-700'

const emptyForm = { title: '', client: '', photographer: '', status: 'In Progress' }

const countKind = (photos, kind) => photos.filter((p) => p.kind === kind).length
// Total photos across a gallery's loose files + every sub-folder.
const totalPhotos = (g) => countKind(g.photos, 'photo') + g.folders.reduce((n, f) => n + countKind(f.photos, 'photo'), 0)
const totalVideos = (g) => countKind(g.photos, 'video') + g.folders.reduce((n, f) => n + countKind(f.photos, 'video'), 0)

const mediaOnly = (fileList) =>
  Array.from(fileList || []).filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))

const toItem = (f, i) => ({
  id: `up-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
  name: f.name,
  src: URL.createObjectURL(f),
  kind: f.type.startsWith('video/') ? 'video' : 'photo',
})

export default function Gallery() {
  const [galleries, setGalleries] = useState(withPhotos)
  const [view, setView] = useState('list') // 'list' | 'folder' | 'form'
  const [openId, setOpenId] = useState(null)
  const [subId, setSubId] = useState(null) // current sub-folder inside the gallery, or null = root
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openGallery = galleries.find((g) => g.id === openId) || null

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const startAdd = () => { setEditing(null); setForm(emptyForm); setView('form') }
  const startEdit = (g) => { setEditing(g); setForm({ title: g.title, client: g.client, photographer: g.photographer, status: g.status }); setView('form') }
  const openFolder = (g) => { setOpenId(g.id); setSubId(null); setView('folder') }

  const saveNow = () => {
    if (editing) {
      setGalleries((prev) => prev.map((g) => (g.id === editing.id ? { ...g, ...form } : g)))
      toast.success('Gallery updated.')
    } else {
      const id = `G-${700 + galleries.length + 10}`
      setGalleries((prev) => [{ ...form, id, cover: null, deliveredDate: null, photos: [], folders: [] }, ...prev])
      toast.success('Gallery created — open it to add folders and photos.')
    }
    setView('list')
  }

  const removeNow = () => {
    setGalleries((prev) => prev.filter((g) => g.id !== deleteTarget.id))
    toast.success('Gallery deleted.')
  }

  // ---- mutate the open gallery ----
  const patchGallery = (fn) =>
    setGalleries((prev) => prev.map((g) => (g.id === openId ? fn(g) : g)))

  // Loose files → current location (gallery root or the open sub-folder).
  const addFiles = (fileList) => {
    const files = mediaOnly(fileList)
    if (!files.length) { toast.error('No photos or videos found.'); return }
    const items = files.map(toItem)
    patchGallery((g) => subId
      ? { ...g, folders: g.folders.map((f) => (f.id === subId ? { ...f, photos: [...items, ...f.photos] } : f)) }
      : { ...g, photos: [...items, ...g.photos] })
    const p = items.filter((i) => i.kind === 'photo').length
    const v = items.length - p
    toast.success(`Added ${p} photo${p !== 1 ? 's' : ''}${v ? ` and ${v} video${v !== 1 ? 's' : ''}` : ''}.`)
  }

  // A whole directory → becomes a sub-folder (merged by name), files stay inside it.
  const uploadFolders = (fileList) => {
    const files = mediaOnly(fileList)
    if (!files.length) { toast.error('The selected folder has no photos or videos.'); return }
    const groups = new Map()
    for (const f of files) {
      const top = f.webkitRelativePath?.split('/')[0] || 'Uploaded folder'
      if (!groups.has(top)) groups.set(top, [])
      groups.get(top).push(f)
    }
    patchGallery((g) => {
      let folders = [...g.folders]
      for (const [name, groupFiles] of groups) {
        const items = groupFiles.map(toItem)
        const idx = folders.findIndex((f) => f.name.toLowerCase() === name.toLowerCase())
        if (idx >= 0) folders[idx] = { ...folders[idx], photos: [...items, ...folders[idx].photos] }
        else folders = [{ id: `fold-${Date.now()}-${name}`, name, photos: items }, ...folders]
      }
      return { ...g, folders }
    })
    const names = [...groups.keys()]
    toast.success(`Uploaded ${names.length} folder${names.length > 1 ? 's' : ''} — ${names.join(', ')} (${files.length} files).`)
  }

  const createFolder = (name) => {
    patchGallery((g) => ({ ...g, folders: [{ id: `fold-${Date.now()}`, name, photos: [] }, ...g.folders] }))
    toast.success(`Folder “${name}” created.`)
  }

  const deletePhoto = (photo) => {
    patchGallery((g) => subId
      ? { ...g, folders: g.folders.map((f) => (f.id === subId ? { ...f, photos: f.photos.filter((p) => p.id !== photo.id) } : f)) }
      : { ...g, photos: g.photos.filter((p) => p.id !== photo.id) })
    toast.success('Removed from gallery.')
  }

  const deleteFolder = (folder) => {
    patchGallery((g) => ({ ...g, folders: g.folders.filter((f) => f.id !== folder.id) }))
    toast.success(`Folder “${folder.name}” deleted.`)
  }

  // =================== CREATE / EDIT FORM ===================
  if (view === 'form') {
    return (
      <div className="max-w-3xl">
        <BackHeader title={editing ? 'Edit gallery' : 'New gallery'} backLabel="Back to galleries"
          onBack={() => setView('list')} description="Create a gallery, then open it to add folders (Engagement, Ceremony, Reception…) and photos." />
        <Card>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Gallery title</Label>
              <Input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Whitfield Wedding" />
            </div>
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Input value={form.client} onChange={(e) => setField('client', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Photographer</Label>
              <Input value={form.photographer} onChange={(e) => setField('photographer', e.target.value)} placeholder="John McCall" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{galleryStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Tip: connect <span className="font-medium text-foreground">Pixieset</span> in Settings to sync galleries automatically — or add folders &amp; photos manually inside.
            </p>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.title.trim()} onClick={() => setConfirmSave(true)}>
                <Check className="size-4" />{editing ? 'Save changes' : 'Create gallery'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <ConfirmDialog open={confirmSave} onOpenChange={setConfirmSave}
          title={editing ? 'Save changes?' : 'Create this gallery?'}
          description={`"${form.title || 'New gallery'}" will be ${editing ? 'updated' : 'created'}.`}
          confirmLabel={editing ? 'Save' : 'Create'} confirmVariant="default" onConfirm={saveNow} />
      </div>
    )
  }

  // =================== FOLDER (Drive-like) VIEW ===================
  if (view === 'folder' && openGallery) {
    return (
      <FolderView
        gallery={openGallery}
        subId={subId}
        setSubId={setSubId}
        onBack={() => setView('list')}
        onAddFiles={addFiles}
        onUploadFolders={uploadFolders}
        onCreateFolder={createFolder}
        onDeletePhoto={deletePhoto}
        onDeleteFolder={deleteFolder}
      />
    )
  }

  // =================== LIST (galleries as folders) ===================
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Gallery" description="Deliver photos and videos to clients — organised in folders, just like a shared drive."
        action={<Button className="gap-1.5" onClick={startAdd}><Plus className="size-4" />New gallery</Button>} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {galleries.map((g, i) => {
          const photos = totalPhotos(g)
          const videos = totalVideos(g)
          const cover = g.photos[0]?.src || g.folders[0]?.photos[0]?.src || g.cover || GALLERY_IMAGES[i % GALLERY_IMAGES.length]
          return (
            <Card key={g.id} className="group flex cursor-pointer flex-col overflow-hidden pt-0 transition-shadow hover:shadow-md"
              onClick={() => openFolder(g)}>
              <div className="relative h-40 w-full overflow-hidden bg-muted">
                <img src={cover} alt={g.title} loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <Badge className={cn(statusTone(g.status), 'absolute right-2 top-2 shadow-sm')} variant="secondary">{g.status}</Badge>
                <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-white">
                  {g.folders.length > 0 && <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-1.5 py-0.5 backdrop-blur-sm"><Folder className="size-3" />{g.folders.length}</span>}
                  <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-1.5 py-0.5 backdrop-blur-sm"><ImageIcon className="size-3" />{photos}</span>
                  {videos > 0 && <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-1.5 py-0.5 backdrop-blur-sm"><Film className="size-3" />{videos}</span>}
                </div>
              </div>
              <CardContent className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{g.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{g.client}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" className="size-7 shrink-0"><MoreVertical className="size-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onSelect={() => openFolder(g)}>Open</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => startEdit(g)}>Edit details</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => toast.success(`Opening ${g.title} in Pixieset.`)}>Open in Pixieset</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget(g)}>Delete gallery</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="mt-auto text-xs text-muted-foreground">
                  {g.photographer}{g.deliveredDate ? ` · delivered ${formatDate(g.deliveredDate)}` : ''}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this gallery?" description={deleteTarget ? `"${deleteTarget.title}" and all its folders and photos will be removed.` : ''}
        confirmLabel="Delete" onConfirm={removeNow} />
    </div>
  )
}

// ------------------------------------------------------------------
// Drive-like folder view: breadcrumb + sub-folders + thumbnail grid
// + drag-drop + lightbox. Two levels deep: gallery → sub-folder → files.
// ------------------------------------------------------------------
function FolderView({
  gallery, subId, setSubId, onBack,
  onAddFiles, onUploadFolders, onCreateFolder, onDeletePhoto, onDeleteFolder,
}) {
  const [query, setQuery] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [removePhoto, setRemovePhoto] = useState(null)
  const [removeFolder, setRemoveFolder] = useState(null)
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const filesRef = useRef(null)
  const folderRef = useRef(null)

  const atRoot = !subId
  const currentFolder = subId ? gallery.folders.find((f) => f.id === subId) : null
  const photos = currentFolder ? currentFolder.photos : gallery.photos

  const q = query.trim().toLowerCase()
  const filteredPhotos = useMemo(
    () => (q ? photos.filter((p) => p.name.toLowerCase().includes(q)) : photos),
    [photos, q]
  )
  // Sub-folders only exist at the gallery root.
  const filteredFolders = useMemo(() => {
    const list = atRoot ? gallery.folders : []
    return q ? list.filter((f) => f.name.toLowerCase().includes(q)) : list
  }, [atRoot, gallery.folders, q])

  const isEmpty = filteredPhotos.length === 0 && filteredFolders.length === 0

  const submitNewFolder = () => {
    const name = newFolderName.trim()
    if (!name) return
    onCreateFolder(name)
    setNewFolderName('')
    setNewFolderOpen(false)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <div>
        <nav className="mb-2 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" />Galleries
          </button>
          <ChevronRight className="size-3.5" />
          <button onClick={() => setSubId(null)}
            className={cn('transition-colors hover:text-foreground', atRoot && 'font-medium text-foreground')}>
            {gallery.title}
          </button>
          {currentFolder && (
            <>
              <ChevronRight className="size-3.5" />
              <span className="font-medium text-foreground">{currentFolder.name}</span>
            </>
          )}
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Folder className="size-5" /></div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">{currentFolder ? currentFolder.name : gallery.title}</h1>
              <p className="text-sm text-muted-foreground">
                {atRoot
                  ? `${gallery.client} · ${gallery.folders.length} folders · ${totalPhotos(gallery)} photos${totalVideos(gallery) ? ` · ${totalVideos(gallery)} videos` : ''}`
                  : `${countKind(photos, 'photo')} photos${countKind(photos, 'video') ? ` · ${countKind(photos, 'video')} videos` : ''}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input ref={filesRef} type="file" accept="image/*,video/*" multiple className="hidden"
              onChange={(e) => { onAddFiles(e.target.files); e.target.value = '' }} />
            <input
              ref={(el) => { folderRef.current = el; if (el) el.webkitdirectory = true }}
              type="file" multiple className="hidden"
              onChange={(e) => { onUploadFolders(e.target.files); e.target.value = '' }} />
            {atRoot && (
              <>
                <Button variant="outline" className="gap-1.5" onClick={() => setNewFolderOpen(true)}>
                  <FolderPlus className="size-4" />New folder
                </Button>
                <Button variant="outline" className="gap-1.5" onClick={() => folderRef.current?.click()}>
                  <Upload className="size-4" />Upload folder
                </Button>
              </>
            )}
            <Button className="gap-1.5" onClick={() => filesRef.current?.click()}>
              <Upload className="size-4" />Add photos
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder={atRoot ? 'Search folders & photos…' : 'Search in this folder…'} className="pl-9" />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false) }}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); onAddFiles(e.dataTransfer.files) }}
        className={cn('flex flex-col gap-6 rounded-xl border-2 border-dashed p-3 transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-transparent')}
      >
        {/* Sub-folders (root only) */}
        {filteredFolders.length > 0 && (
          <div>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Folders</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {filteredFolders.map((f) => (
                <button key={f.id} type="button" onClick={() => { setQuery(''); setSubId(f.id) }}
                  className="group/f relative flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-left transition-shadow hover:shadow-sm">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-primary/10">
                    {f.photos[0]
                      ? <img src={f.photos[0].src} alt="" className="size-full object-cover" />
                      : <span className="flex size-full items-center justify-center text-primary"><Folder className="size-5" /></span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.photos.length} item{f.photos.length !== 1 ? 's' : ''}</p>
                  </div>
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => { e.stopPropagation(); setRemoveFolder(f) }}
                    className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover/f:opacity-100"
                    aria-label="Delete folder"
                  >
                    <Trash2 className="size-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        {filteredPhotos.length > 0 && (
          <div>
            {atRoot && filteredFolders.length > 0 && (
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Files</p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {filteredPhotos.map((p) => (
                <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                  {p.kind === 'video' ? (
                    <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 to-slate-950 text-white">
                      <Film className="size-8 opacity-90" />
                      <span className="px-2 text-center text-[10px] leading-tight opacity-70">Video</span>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setLightbox(p)} className="size-full">
                      <img src={p.src} alt={p.name} loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </button>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="block truncate text-[10px] font-medium text-white">{p.name}</span>
                  </div>
                  <button type="button" onClick={() => setRemovePhoto(p)}
                    className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-md bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-destructive group-hover:opacity-100"
                    aria-label="Remove">
                    <Trash2 className="size-3.5" />
                  </button>
                  {p.kind === 'video' && <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1 text-[9px] font-medium text-white">MP4</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {isEmpty && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"><Upload className="size-7" /></div>
            <div>
              <p className="font-medium">{query ? 'No matches' : atRoot ? 'This gallery is empty' : 'This folder is empty'}</p>
              <p className="text-sm text-muted-foreground">
                {query ? 'Try a different search.'
                  : atRoot ? 'Use Upload folder for a whole set, or Add photos for loose files. You can also drag files here.'
                    : 'Add photos, or drag files here.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New folder dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>New folder</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>Folder name</Label>
            <Input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Engagement / Ceremony / Reception"
              onKeyDown={(e) => e.key === 'Enter' && submitNewFolder()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>Cancel</Button>
            <Button disabled={!newFolderName.trim()} onClick={submitNewFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setLightbox(null)}>
          <button className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20" onClick={() => setLightbox(null)} aria-label="Close">
            <X className="size-5" />
          </button>
          <figure className="flex max-h-full max-w-4xl flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.name} className="max-h-[80vh] rounded-lg object-contain" />
            <figcaption className="flex items-center gap-3 text-sm text-white/80">
              <span>{lightbox.name}</span>
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => toast.success('Download starts during development.')}>
                <Download className="size-3.5" />Download
              </Button>
            </figcaption>
          </figure>
        </div>
      )}

      <ConfirmDialog open={!!removePhoto} onOpenChange={(open) => !open && setRemovePhoto(null)}
        title="Remove this file?" description={removePhoto ? `"${removePhoto.name}" will be removed.` : ''}
        confirmLabel="Remove" onConfirm={() => { onDeletePhoto(removePhoto); setRemovePhoto(null) }} />

      <ConfirmDialog open={!!removeFolder} onOpenChange={(open) => !open && setRemoveFolder(null)}
        title="Delete this folder?" description={removeFolder ? `"${removeFolder.name}" and its ${removeFolder.photos.length} file(s) will be removed.` : ''}
        confirmLabel="Delete" onConfirm={() => { onDeleteFolder(removeFolder); setRemoveFolder(null) }} />
    </div>
  )
}
