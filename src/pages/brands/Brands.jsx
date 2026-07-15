import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Check, Pencil, Trash2, Globe, Mail, Building2, Workflow, Image as ImageIcon, Palette, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { brands as initialBrands, workflowTemplates } from '@/data/brands'
import { cn } from '@/lib/utils'

const emptyForm = {
  name: '', type: '', domain: '', email: '', color: '#719f87', logo: null,
  workflow: 'Wedding Planning', status: 'Active',
}

// Handy starter palette for the colour-identity widget.
const COLOR_PRESETS = ['#719f87', '#c2a15b', '#b05c5c', '#5c7bb0', '#8a5cb0', '#3f4d5a', '#c77d4a', '#2f6f6a']

export default function Brands() {
  const [brands, setBrands] = useState(initialBrands)
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))
  const startAdd = () => { setEditing(null); setForm(emptyForm); setView('form') }
  const startEdit = (b) => { setEditing(b); setForm({ ...b }); setView('form') }

  // Opened via the sidebar brand-switcher "Add new business" option.
  const location = useLocation()
  useEffect(() => {
    if (location.state?.addNew) startAdd()
  }, [location.state])

  const logoRef = useRef(null)
  const onLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setField('logo', reader.result); toast.success('Logo added.') }
    reader.readAsDataURL(file)
  }

  const saveNow = () => {
    if (editing) {
      setBrands((prev) => prev.map((b) => (b.id === editing.id ? { ...b, ...form } : b)))
      toast.success(`Brand "${form.name}" updated.`)
    } else {
      const id = form.name.toLowerCase().replace(/[^a-z]+/g, '').slice(0, 6) || `br${brands.length}`
      setBrands((prev) => [...prev, { ...form, id, clients: 0, logo: null }])
      toast.success(`Brand "${form.name}" created — branding is live.`)
    }
    setView('list')
  }

  const removeNow = () => {
    setBrands((prev) => prev.filter((b) => b.id !== deleteTarget.id))
    toast.success(`Brand "${deleteTarget.name}" removed.`)
  }

  if (view === 'form') {
    return (
      <div className="max-w-6xl">
        <BackHeader
          title={editing ? 'Edit brand' : 'Add new business'}
          description="Give the brand its own identity. The look is applied instantly; the workflow is reused or configured."
          backLabel="Back to brands"
          onBack={() => setView('list')}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* LEFT — the build-your-brand widgets */}
          <div className="flex flex-col gap-5">
            <SectionCard step={1} icon={Building2} title="Studio details" desc="What the business is called and what it does.">
              <div className="space-y-1.5">
                <Label>Business / studio name</Label>
                <Input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Family Affair Key West" />
              </div>
              <div className="space-y-1.5">
                <Label>Business type</Label>
                <Input value={form.type} onChange={(e) => setField('type', e.target.value)} placeholder="Weddings & Event Planning" />
              </div>
            </SectionCard>

            <SectionCard step={2} icon={Workflow} title="Workflow template" desc="Reuse an existing journey (zero setup) or configure a new one.">
              <div className="space-y-1.5">
                <Label>Template</Label>
                <Select value={form.workflow} onValueChange={(v) => setField('workflow', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{workflowTemplates.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The full lead → contract → planning pipeline is applied from this template — no developer needed.
                </p>
              </div>
            </SectionCard>

            <SectionCard step={3} icon={ImageIcon} title="Logo" desc="Upload the brand mark — shown across the client portal.">
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
              {form.logo ? (
                <div className="flex items-center gap-4 rounded-xl border border-border p-3">
                  <div className="flex size-16 items-center justify-center rounded-lg bg-white ring-1 ring-border">
                    <img src={form.logo} alt="Logo preview" className="size-14 object-contain" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Logo uploaded</p>
                    <p className="text-xs text-muted-foreground">Shown on login, sidebar & emails.</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => logoRef.current?.click()}>Replace</Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setField('logo', null)}><X className="size-4" /></Button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => logoRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/30">
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Upload className="size-5" /></div>
                  <p className="text-sm font-medium">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground">PNG, SVG or JPG — square works best</p>
                </button>
              )}
            </SectionCard>

            <SectionCard step={4} icon={Palette} title="Color identity" desc="The primary colour that themes the whole portal.">
              <div className="flex items-center gap-3">
                <input type="color" value={form.color} onChange={(e) => setField('color', e.target.value)} className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent" />
                <Input value={form.color} onChange={(e) => setField('color', e.target.value)} className="max-w-40" />
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button key={c} type="button" onClick={() => setField('color', c)}
                    className={cn('size-7 rounded-full ring-2 ring-offset-2 ring-offset-card transition-transform hover:scale-110',
                      form.color.toLowerCase() === c.toLowerCase() ? 'ring-foreground' : 'ring-transparent')}
                    style={{ background: c }} title={c} />
                ))}
              </div>
            </SectionCard>

            <SectionCard step={5} icon={Globe} title="Domain & email" desc="Where the brand lives and sends from.">
              <div className="space-y-1.5">
                <Label>Domain</Label>
                <Input value={form.domain} onChange={(e) => setField('domain', e.target.value)} placeholder="brand.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Sending email</Label>
                <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="hello@brand.com" />
              </div>
            </SectionCard>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.name.trim()} onClick={() => setConfirmSave(true)}>
                <Check className="size-4" />{editing ? 'Save changes' : 'Create brand'}
              </Button>
            </div>
          </div>

          {/* RIGHT — live preview that updates as you build */}
          <div className="lg:sticky lg:top-6 h-fit">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Live preview</p>
            <BrandPreviewCard form={form} />
            <p className="mt-3 text-center text-xs text-muted-foreground">This is how the brand appears across its portal.</p>
          </div>
        </div>

        <ConfirmDialog
          open={confirmSave}
          onOpenChange={setConfirmSave}
          title={editing ? 'Save changes?' : 'Create this brand?'}
          description={`"${form.name || 'New brand'}" will be ${editing ? 'updated' : 'added'} with its own branding and portal.`}
          confirmLabel={editing ? 'Save' : 'Create'}
          confirmVariant="default"
          onConfirm={saveNow}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Brands"
        description="Manage both brands from one backend — and add new businesses with their own identity."
        action={<Button className="gap-1.5" onClick={startAdd}><Plus className="size-4" />Add new business</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {brands.map((b) => (
          <Card key={b.id}>
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <div className="flex size-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-border" style={{ borderColor: b.color }}>
                {b.logo ? <img src={b.logo} alt={b.name} className="size-9 object-contain" />
                  : <span className="font-display text-lg font-semibold" style={{ color: b.color }}>{b.name.slice(0, 2)}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-lg">{b.name}</CardTitle>
                <p className="truncate text-sm text-muted-foreground">{b.type}</p>
              </div>
              <span className="size-4 rounded-full ring-2 ring-white" style={{ background: b.color }} title="Brand color" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-1.5 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground"><Globe className="size-4" />{b.domain}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" />{b.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{b.workflow}</Badge>
                <Badge variant="secondary">{b.clients} clients</Badge>
                <Badge className="bg-emerald-500/15 text-emerald-700" variant="secondary">{b.status}</Badge>
              </div>
              <div className="flex justify-end gap-1 border-t border-border pt-3">
                <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => startEdit(b)}><Pencil className="size-3.5" />Edit</Button>
                <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(b)}><Trash2 className="size-3.5" />Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this brand?"
        description={deleteTarget ? `"${deleteTarget.name}" and its portal will be removed. This cannot be undone.` : ''}
        confirmLabel="Remove"
        onConfirm={removeNow}
      />
    </div>
  )
}

// A single build step, rendered as its own widget card with a numbered badge.
function SectionCard({ step, icon: Icon, title, desc, children }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3 space-y-0 pb-4">
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4.5" />
          <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{step}</span>
        </div>
        <div className="min-w-0">
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

// Right-hand live preview — updates instantly as the widgets are filled in.
function BrandPreviewCard({ form }) {
  const color = form.color || '#719f87'
  const name = form.name || 'Your Studio Name'
  const initials = (form.name || 'YS').replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'YS'
  return (
    <Card className="overflow-hidden pt-0">
      {/* Branded banner uses the chosen colour */}
      <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
        <div className="absolute -bottom-7 left-5 flex size-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-black/5">
          {form.logo
            ? <img src={form.logo} alt={name} className="size-12 object-contain" />
            : <span className="font-display text-xl font-semibold" style={{ color }}>{initials}</span>}
        </div>
      </div>
      <CardContent className="space-y-3 px-5 pb-5 pt-9">
        <div>
          <p className="font-display text-lg font-semibold leading-tight">{name}</p>
          <p className="text-sm text-muted-foreground">{form.type || 'Business type'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{form.workflow}</Badge>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-3 rounded-full ring-1 ring-black/10" style={{ background: color }} />{color}
          </span>
        </div>

        <div className="grid gap-1.5 border-t border-border pt-3 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground"><Globe className="size-4" />{form.domain || 'brand.com'}</p>
          <p className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" />{form.email || 'hello@brand.com'}</p>
        </div>

        {/* Accent button shows the colour applied to the portal */}
        <button type="button" className="w-full rounded-lg py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ background: color }}>
          Enter Client Portal
        </button>
      </CardContent>
    </Card>
  )
}
