import { useMemo, useState } from 'react'
import { Plus, Check, Star, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { RowActions } from '@/components/common/RowActions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { vendors as initialVendors, vendorCategories } from '@/data/vendors'

const emptyForm = {
  name: '', category: 'Florist', contact: '', phone: '', email: '', rating: 4.5, notes: '',
}

export default function Vendors() {
  const [vendors, setVendors] = useState(initialVendors)
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const startAdd = () => { setEditing(null); setForm(emptyForm); setView('form') }
  const startEdit = (v) => { setEditing(v); setForm({ ...v }); setView('form') }

  const columns = useMemo(() => [
    { key: 'name', header: 'Vendor', sortable: true, className: 'font-medium' },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      cell: (v) => <Badge variant="outline">{v.category}</Badge>,
    },
    {
      key: 'contact',
      header: 'Contact',
      sortable: true,
      cell: (v) => (
        <>
          <p className="text-sm">{v.contact}</p>
          <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Phone className="size-3" />{v.phone}</span>
            <span className="inline-flex items-center gap-1"><Mail className="size-3" />{v.email}</span>
          </p>
        </>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      cell: (v) => (
        <span className="inline-flex items-center gap-1 text-sm font-medium">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />{v.rating}
        </span>
      ),
    },
    { key: 'eventsCount', header: 'Events', sortable: true, className: 'text-sm text-muted-foreground' },
    {
      key: 'actions',
      header: '',
      stopClick: true,
      headClassName: 'w-10',
      cell: (v) => <RowActions onEdit={() => startEdit(v)} onDelete={() => setDeleteTarget(v)} />,
    },
  ], [])

  const saveNow = () => {
    const payload = { ...form, rating: Number(form.rating) || 0 }
    if (editing) {
      setVendors((prev) => prev.map((v) => (v.id === editing.id ? { ...v, ...payload } : v)))
      toast.success(`Vendor "${payload.name}" updated.`)
    } else {
      setVendors((prev) => [{ ...payload, id: `V-${100 + vendors.length + 10}`, eventsCount: 0 }, ...prev])
      toast.success(`Vendor "${payload.name}" added.`)
    }
    setView('list')
  }

  const removeNow = () => {
    setVendors((prev) => prev.filter((v) => v.id !== deleteTarget.id))
    toast.success(`Vendor "${deleteTarget.name}" removed.`)
  }

  if (view === 'form') {
    return (
      <div className="max-w-5xl">
        <BackHeader title={editing ? 'Edit vendor' : 'New vendor'} backLabel="Back to vendors"
          onBack={() => setView('list')} description="Keep your preferred vendors and their contact details handy." />
        <Card>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Vendor name</Label>
              <Input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Coral Blooms Florals" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setField('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{vendorCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Contact person</Label>
              <Input value={form.contact} onChange={(e) => setField('contact', e.target.value)} placeholder="Lena Ortiz" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Rating (0–5)</Label>
              <Input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => setField('rating', e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea rows={3} value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.name.trim()} onClick={() => setConfirmSave(true)}>
                <Check className="size-4" />{editing ? 'Save changes' : 'Add vendor'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <ConfirmDialog open={confirmSave} onOpenChange={setConfirmSave}
          title={editing ? 'Save changes?' : 'Add this vendor?'}
          description={`"${form.name || 'New vendor'}" will be ${editing ? 'updated' : 'added to your directory'}.`}
          confirmLabel={editing ? 'Save' : 'Add'} confirmVariant="default" onConfirm={saveNow} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Vendors" description="Your trusted vendor directory across both brands."
        action={<Button className="gap-1.5" onClick={startAdd}><Plus className="size-4" />New vendor</Button>} />

      <DataTable
        title="All vendors"
        description={`${vendors.length} vendors on record`}
        columns={columns}
        rows={vendors}
        onRowClick={startEdit}
        searchKeys={['name', 'contact', 'email', 'phone', 'category']}
        searchPlaceholder="Search by vendor, contact, email…"
        filters={[{ key: 'category', label: 'Category', options: vendorCategories }]}
        emptyMessage="No vendors yet."
      />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this vendor?" description={deleteTarget ? `"${deleteTarget.name}" will be removed from your directory.` : ''}
        confirmLabel="Remove" onConfirm={removeNow} />
    </div>
  )
}
