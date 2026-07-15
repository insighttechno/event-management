import { useMemo, useState, useSyncExternalStore } from 'react'
import { Plus, Check, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { BrandBadge } from '@/components/common/BrandBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { RowActions } from '@/components/common/RowActions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { events as initialEvents, eventStatuses } from '@/data/events'
import {
  brandOfEvent, getActiveBrand, matchesBrand, subscribeActiveBrand,
} from '@/lib/brand-scope'
import { packageBrands } from '@/data/packages'
import { formatDate } from '@/lib/utils'

// Brand comes from the event's client, not from guessing at the event type —
// a Family Affair client can book a photography session too.
const eventBrand = (e) => brandOfEvent(e) ?? 'Family Affair'

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
  const activeBrand = useSyncExternalStore(subscribeActiveBrand, getActiveBrand)
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const startAdd = () => { setEditing(null); setForm(emptyForm); setView('form') }
  const startEdit = (e) => { setEditing(e); setForm({ ...e, brand: eventBrand(e) }); setView('form') }

  const columns = useMemo(() => [
    { key: 'name', header: 'Event', sortable: true, className: 'font-medium' },
    { key: 'client', header: 'Client', sortable: true, className: 'text-sm' },
    {
      key: 'brand',
      header: 'Brand',
      sortable: true,
      sortValue: eventBrand,
      cell: (e) => <BrandBadge brand={eventBrand(e)} />,
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      className: 'text-sm',
      cell: (e) => (e.date ? formatDate(e.date) : '—'),
    },
    { key: 'venue', header: 'Venue', sortable: true, className: 'text-sm text-muted-foreground' },
    {
      key: 'guestCount',
      header: 'Guests',
      sortable: true,
      className: 'text-sm',
      cell: (e) => e.guestCount || '—',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (e) => <Badge className={statusTone(e.status)} variant="secondary">{e.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      stopClick: true,
      headClassName: 'w-28 text-right',
      cell: (e) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => startEdit(e)}>
            <Eye className="size-3.5" />Open
          </Button>
          <RowActions onEdit={() => startEdit(e)} onDelete={() => setDeleteTarget(e)} />
        </div>
      ),
    },
  ], [])

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

  // `events` stays whole for writes; only the list is scoped to the brand.
  const brandEvents = useMemo(
    () => events.filter((e) => matchesBrand(brandOfEvent(e), activeBrand)),
    [events, activeBrand]
  )
  const upcoming = brandEvents.filter((e) => e.status !== 'Completed' && e.status !== 'Cancelled').length

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

      <DataTable
        title="All events"
        description={`${brandEvents.length} events · ${upcoming} upcoming`}
        columns={columns}
        rows={brandEvents}
        onRowClick={startEdit}
        searchKeys={['name', 'client', 'venue', 'planner', 'type']}
        searchPlaceholder="Search by event, client, venue…"
        filters={[
          { key: 'brand', label: 'Brand', options: packageBrands, match: (e, v) => eventBrand(e) === v },
          { key: 'status', label: 'Status', options: eventStatuses },
        ]}
        emptyMessage="No events yet."
      />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this event?" description={deleteTarget ? `"${deleteTarget.name}" will be removed.` : ''}
        confirmLabel="Delete" onConfirm={removeNow} />
    </div>
  )
}
