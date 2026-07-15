import { useState } from 'react'
import { Plus, Check, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { BrandBadge } from '@/components/common/BrandBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { RowActions } from '@/components/common/RowActions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { events as initialEvents, eventStatuses } from '@/data/events'
import { packageBrands } from '@/data/packages'
import { formatDate } from '@/lib/utils'

const eventBrand = (e) => e.brand || (e.type === 'Photography' ? 'Senses At Play' : 'Family Affair')

const statusTone = (s) =>
  s === 'Completed' ? 'bg-emerald-500/15 text-emerald-700'
    : s === 'Confirmed' ? 'bg-primary/15 text-primary'
    : s === 'Cancelled' ? 'bg-destructive/15 text-destructive'
    : 'bg-amber-500/15 text-amber-700'

const emptyForm = {
  name: '', client: '', brand: 'Family Affair', type: 'Wedding', date: '', venue: '',
  guestCount: '', budget: '', status: 'Planning', planner: '',
}

export default function Events() {
  const [events, setEvents] = useState(initialEvents)
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const startAdd = () => { setEditing(null); setForm(emptyForm); setView('form') }
  const startEdit = (e) => { setEditing(e); setForm({ ...e, brand: eventBrand(e) }); setView('form') }

  const saveNow = () => {
    const payload = { ...form, guestCount: Number(form.guestCount) || 0, budget: Number(form.budget) || 0 }
    if (editing) {
      setEvents((prev) => prev.map((e) => (e.id === editing.id ? { ...e, ...payload } : e)))
      toast.success(`Event "${payload.name}" updated.`)
    } else {
      setEvents((prev) => [{ ...payload, id: `E-${2000 + events.length + 10}`, milestones: [] }, ...prev])
      toast.success(`Event "${payload.name}" created.`)
    }
    setView('list')
  }

  const removeNow = () => {
    setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    toast.success(`Event "${deleteTarget.name}" deleted.`)
  }

  const upcoming = events.filter((e) => e.status !== 'Completed' && e.status !== 'Cancelled').length

  if (view === 'form') {
    return (
      <div className="max-w-5xl">
        <BackHeader title={editing ? 'Edit event' : 'New event'} backLabel="Back to events"
          onBack={() => setView('list')} description="Track the event, venue, guest count and status." />
        <Card>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Event name</Label>
              <Input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Whitfield Wedding" />
            </div>
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Input value={form.client} onChange={(e) => setField('client', e.target.value)} placeholder="Sarah & James Whitfield" />
            </div>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Select value={form.brand} onValueChange={(v) => setField('brand', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{packageBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Input value={form.type} onChange={(e) => setField('type', e.target.value)} placeholder="Wedding / Vow Renewal / Photography" />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Venue</Label>
              <Input value={form.venue} onChange={(e) => setField('venue', e.target.value)} placeholder="Smathers Beach, Key West" />
            </div>
            <div className="space-y-1.5">
              <Label>Guest count</Label>
              <Input type="number" min={0} value={form.guestCount} onChange={(e) => setField('guestCount', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Budget (USD)</Label>
              <Input type="number" min={0} value={form.budget} onChange={(e) => setField('budget', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Planner</Label>
              <Input value={form.planner} onChange={(e) => setField('planner', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{eventStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.name.trim()} onClick={() => setConfirmSave(true)}>
                <Check className="size-4" />{editing ? 'Save changes' : 'Create event'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <ConfirmDialog open={confirmSave} onOpenChange={setConfirmSave}
          title={editing ? 'Save changes?' : 'Create this event?'}
          description={`"${form.name || 'New event'}" will be ${editing ? 'updated' : 'created'}.`}
          confirmLabel={editing ? 'Save' : 'Create'} confirmVariant="default" onConfirm={saveNow} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Events" description="Every wedding, shoot and celebration across both brands."
        action={<Button className="gap-1.5" onClick={startAdd}><Plus className="size-4" />New event</Button>} />

      <Card>
        <CardHeader>
          <CardTitle>All events</CardTitle>
          <CardDescription>{events.length} events · {upcoming} upcoming</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell className="text-sm">{e.client}</TableCell>
                  <TableCell><BrandBadge brand={eventBrand(e)} /></TableCell>
                  <TableCell className="text-sm">{e.date ? formatDate(e.date) : '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.venue}</TableCell>
                  <TableCell className="text-sm">{e.guestCount || '—'}</TableCell>
                  <TableCell><Badge className={statusTone(e.status)} variant="secondary">{e.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => startEdit(e)}><Eye className="size-3.5" />Open</Button>
                      <RowActions onEdit={() => startEdit(e)} onDelete={() => setDeleteTarget(e)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this event?" description={deleteTarget ? `"${deleteTarget.name}" will be removed.` : ''}
        confirmLabel="Delete" onConfirm={removeNow} />
    </div>
  )
}
