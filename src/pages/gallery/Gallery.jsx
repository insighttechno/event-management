import { useRef, useState } from 'react'
import { Plus, Check, Image as ImageIcon, Film, ExternalLink, Upload } from 'lucide-react'
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
import { galleries as initialGalleries } from '@/data/finance'
import { cn, formatDate } from '@/lib/utils'

const galleryStatuses = ['In Progress', 'Editing', 'Delivered']

// Cover images used as a fallback for galleries created without an explicit cover.
const GALLERY_COVERS = [
  '/images/gallery/g1.jpg', '/images/gallery/g2.jpg', '/images/gallery/g3.jpg',
  '/images/gallery/g4.jpg', '/images/gallery/g5.jpg', '/images/gallery/g6.jpg',
]

const statusTone = (s) =>
  s === 'Delivered' ? 'bg-emerald-500/15 text-emerald-700'
    : s === 'Editing' ? 'bg-primary/15 text-primary'
    : 'bg-amber-500/15 text-amber-700'

const emptyForm = { title: '', client: '', photographer: '', status: 'In Progress', photoCount: 0, videoCount: 0 }

export default function Gallery() {
  const [galleries, setGalleries] = useState(initialGalleries)
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fileRef = useRef(null)
  const onFilesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const photos = files.filter((f) => f.type.startsWith('image/')).length
    const videos = files.filter((f) => f.type.startsWith('video/')).length
    setForm((p) => ({
      ...p,
      photoCount: (Number(p.photoCount) || 0) + photos,
      videoCount: (Number(p.videoCount) || 0) + videos,
    }))
    toast.success(`Added ${photos} photo${photos !== 1 ? 's' : ''} and ${videos} video${videos !== 1 ? 's' : ''}.`)
  }

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const startAdd = () => { setEditing(null); setForm(emptyForm); setView('form') }
  const startEdit = (g) => { setEditing(g); setForm({ ...g }); setView('form') }

  const saveNow = () => {
    const payload = { ...form, photoCount: Number(form.photoCount) || 0, videoCount: Number(form.videoCount) || 0 }
    if (editing) {
      setGalleries((prev) => prev.map((g) => (g.id === editing.id ? { ...g, ...payload } : g)))
      toast.success('Gallery updated.')
    } else {
      setGalleries((prev) => [{ ...payload, id: `G-${700 + galleries.length + 10}`, deliveredDate: null }, ...prev])
      toast.success('Gallery created.')
    }
    setView('list')
  }

  const removeNow = () => {
    setGalleries((prev) => prev.filter((g) => g.id !== deleteTarget.id))
    toast.success('Gallery deleted.')
  }

  if (view === 'form') {
    return (
      <div className="max-w-4xl">
        <BackHeader title={editing ? 'Edit gallery' : 'New gallery'} backLabel="Back to galleries"
          onBack={() => setView('list')} description="Deliver photos & videos to clients (Pixieset integration in Phase 1)." />
        <Card>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Gallery title</Label>
              <Input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Whitfield Engagement Session" />
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
              <Label>Upload photos &amp; videos</Label>
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={onFilesChange} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/30">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Upload className="size-6" /></div>
                <p className="text-sm font-medium">Click to upload photos &amp; videos</p>
                <p className="text-xs text-muted-foreground">
                  {(Number(form.photoCount) || 0)} photos · {(Number(form.videoCount) || 0)} videos in this gallery
                </p>
              </button>
              <p className="text-xs text-muted-foreground">
                Or connect <span className="font-medium text-foreground">Pixieset</span> in Settings to sync galleries automatically via API — no manual upload needed.
              </p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{galleryStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Gallery" description="Deliver photos and videos to clients — the core deliverable for Senses At Play."
        action={<Button className="gap-1.5" onClick={startAdd}><Plus className="size-4" />New gallery</Button>} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {galleries.map((g, i) => (
          <Card key={g.id} className="flex flex-col overflow-hidden pt-0">
            <div className="relative h-40 w-full overflow-hidden bg-muted">
              <img
                src={g.cover || GALLERY_COVERS[i % GALLERY_COVERS.length]}
                alt={g.title}
                loading="lazy"
                className="size-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <Badge className={cn(statusTone(g.status), 'absolute right-2 top-2 shadow-sm')} variant="secondary">{g.status}</Badge>
              <div className="absolute bottom-2 left-2 flex gap-2 text-[11px] font-medium text-white">
                <span className="inline-flex items-center gap-1 rounded-md bg-black/35 px-1.5 py-0.5 backdrop-blur-sm"><ImageIcon className="size-3" />{g.photoCount}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-black/35 px-1.5 py-0.5 backdrop-blur-sm"><Film className="size-3" />{g.videoCount}</span>
              </div>
            </div>
            <CardContent className="flex flex-1 flex-col gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{g.title}</p>
                <p className="truncate text-xs text-muted-foreground">{g.client}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {g.photographer}{g.deliveredDate ? ` · delivered ${formatDate(g.deliveredDate)}` : ''}
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => toast.success(`Opening ${g.title} in Pixieset.`)}>
                  <ExternalLink className="size-3.5" />Open
                </Button>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(g)}>Edit</Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(g)}>Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this gallery?" description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : ''}
        confirmLabel="Delete" onConfirm={removeNow} />
    </div>
  )
}
