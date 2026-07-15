import { useState } from 'react'
import { Plus, Pencil, Trash2, Clock, Check } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { BrandBadge } from '@/components/common/BrandBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { packages as initialPackages, packageBrands } from '@/data/packages'
import { formatCurrency } from '@/lib/utils'

const emptyForm = {
  brand: 'Family Affair',
  name: '',
  tagline: '',
  price: '',
  oneHourCredits: 1,
  halfHourCredits: 4,
  finalPaymentDays: 60,
  supportWindowDays: 45,
  inclusions: '',
  active: true,
}

export default function Packages() {
  const [packages, setPackages] = useState(initialPackages)
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const startAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setView('form')
  }

  const startEdit = (pkg) => {
    setEditing(pkg)
    setForm({ ...pkg, inclusions: pkg.inclusions.join('\n') })
    setView('form')
  }

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const saveNow = () => {
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      oneHourCredits: Number(form.oneHourCredits) || 0,
      halfHourCredits: Number(form.halfHourCredits) || 0,
      finalPaymentDays: Number(form.finalPaymentDays) || 0,
      supportWindowDays: Number(form.supportWindowDays) || 0,
      inclusions: form.inclusions.split('\n').map((s) => s.trim()).filter(Boolean),
    }
    if (editing) {
      setPackages((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p)))
      toast.success(`Package "${payload.name}" updated.`)
    } else {
      const id = `PK-${String(packages.length + 1).padStart(2, '0')}`
      setPackages((prev) => [{ ...payload, id, clients: 0, priceUnit: 'from' }, ...prev])
      toast.success(`Package "${payload.name}" created.`)
    }
    setView('list')
  }

  const removeNow = () => {
    setPackages((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    toast.success(`Package "${deleteTarget.name}" deleted.`)
  }

  // ---------- In-page add/edit form ----------
  if (view === 'form') {
    return (
      <div className="max-w-5xl">
        <BackHeader
          title={editing ? 'Edit package' : 'New package'}
          description="Set the pricing, consultation credits and reminder schedule for this package."
          backLabel="Back to packages"
          onBack={() => setView('list')}
        />
        <Card>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Select value={form.brand} onValueChange={(v) => setField('brand', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {packageBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Starting price (USD)</Label>
              <Input type="number" min={0} value={form.price} onChange={(e) => setField('price', e.target.value)} placeholder="42000" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Package name</Label>
              <Input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Signature Full Planning" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Tagline</Label>
              <Input value={form.tagline} onChange={(e) => setField('tagline', e.target.value)} placeholder="Full-service, start to finish" />
            </div>
            <div className="space-y-1.5">
              <Label>1-hour consultation credits</Label>
              <Input type="number" min={0} value={form.oneHourCredits} onChange={(e) => setField('oneHourCredits', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>30-min consultation credits</Label>
              <Input type="number" min={0} value={form.halfHourCredits} onChange={(e) => setField('halfHourCredits', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Final payment (days before event)</Label>
              <Input type="number" min={0} value={form.finalPaymentDays} onChange={(e) => setField('finalPaymentDays', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Support window opens (days before)</Label>
              <Input type="number" min={0} value={form.supportWindowDays} onChange={(e) => setField('supportWindowDays', e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Inclusions (one per line)</Label>
              <Textarea
                rows={5}
                value={form.inclusions}
                onChange={(e) => setField('inclusions', e.target.value)}
                placeholder={'Full vendor sourcing\nCustom timeline\nOn-site coordination'}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Checkbox id="active" checked={form.active} onCheckedChange={(v) => setField('active', !!v)} />
              <Label htmlFor="active" className="font-normal">Active — available for new clients</Label>
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.name.trim()} onClick={() => setConfirmSave(true)}>
                <Check className="size-4" />
                {editing ? 'Save changes' : 'Create package'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={confirmSave}
          onOpenChange={setConfirmSave}
          title={editing ? 'Save changes?' : 'Create this package?'}
          description={`"${form.name || 'New package'}" will be ${editing ? 'updated' : 'added'} and available to assign to clients.`}
          confirmLabel={editing ? 'Save' : 'Create'}
          confirmVariant="default"
          onConfirm={saveNow}
        />
      </div>
    )
  }

  // ---------- List ----------
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Packages"
        description="Create and edit packages, their consultation credits and reminder schedules — no developer needed."
        action={
          <Button className="gap-1.5" onClick={startAdd}>
            <Plus className="size-4" />
            Add package
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="flex flex-col">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <BrandBadge brand={pkg.brand} />
                {!pkg.active && <Badge variant="outline">Inactive</Badge>}
              </div>
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{pkg.tagline}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div>
                <p className="font-display text-2xl font-semibold">
                  {formatCurrency(pkg.price)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">starting</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="gap-1"><Clock className="size-3" />{pkg.oneHourCredits}×1hr · {pkg.halfHourCredits}×30min</Badge>
                <Badge variant="outline">Final pay {pkg.finalPaymentDays}d out</Badge>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {pkg.inclusions.slice(0, 4).map((inc) => (
                  <li key={inc} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {inc}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">{pkg.clients} client{pkg.clients === 1 ? '' : 's'}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => startEdit(pkg)}>
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(pkg)}>
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this package?"
        description={deleteTarget ? `"${deleteTarget.name}" will be removed. Existing clients keep their assigned package.` : ''}
        confirmLabel="Delete"
        onConfirm={removeNow}
      />
    </div>
  )
}
