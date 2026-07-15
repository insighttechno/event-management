import { useMemo, useState, useSyncExternalStore } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Check, FileText, Clock, ShieldCheck, KeyRound, CalendarPlus, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { BrandBadge } from '@/components/common/BrandBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { RowActions } from '@/components/common/RowActions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { getClients, setClients, subscribeClients } from '@/lib/clients-store'
import { getActiveBrand, matchesBrand, subscribeActiveBrand } from '@/lib/brand-scope'
import { clientStatuses } from '@/data/clients'
import { packages, packageBrands } from '@/data/packages'
import { formatCurrency, formatDate } from '@/lib/utils'

const emptyForm = {
  name: '', brand: 'Family Affair', email: '', phone: '',
  package: '', event: '', eventDate: '', status: 'Active',
  onboarding: 'Pending', creditsUsed: 0, creditsTotal: 0, balance: 0,
}

const statusTone = (s) =>
  s === 'Active' ? 'bg-primary/15 text-primary'
    : s === 'Completed' ? 'bg-emerald-500/15 text-emerald-700'
    : 'bg-muted text-muted-foreground'

export default function Clients() {
  const navigate = useNavigate()
  const location = useLocation()
  const allClients = useSyncExternalStore(subscribeClients, getClients)
  const activeBrand = useSyncExternalStore(subscribeActiveBrand, getActiveBrand)
  const clients = useMemo(
    () => allClients.filter((c) => matchesBrand(c.brand, activeBrand)),
    [allClients, activeBrand]
  )

  // The detail page sends us here to edit — open straight into the form.
  const editIdFromNav = location.state?.editId
  const clientFromNav = editIdFromNav ? getClients().find((c) => c.id === editIdFromNav) : null

  const [view, setView] = useState(clientFromNav ? 'form' : 'list')
  const [editing, setEditing] = useState(clientFromNav)
  const [form, setForm] = useState(() => (clientFromNav ? { ...clientFromNav } : emptyForm))
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  const startAdd = () => { setEditing(null); setForm(emptyForm); setView('form') }
  const startEdit = (c) => { setEditing(c); setForm({ ...c }); setView('form') }
  const openDetail = (c) => navigate(`/admin/clients/${c.id}`)

  // Native scheduling for an active client's package calls (consultation credits).
  const scheduleMeeting = (c) => navigate('/admin/calendar', {
    state: { scheduleFor: { client: c.name, email: c.email, brand: c.brand } },
  })

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Client',
      sortable: true,
      cell: (c) => (
        <>
          <p className="font-medium">{c.name}</p>
          <p className="text-xs text-muted-foreground">{c.email}</p>
        </>
      ),
    },
    { key: 'brand', header: 'Brand', sortable: true, cell: (c) => <BrandBadge brand={c.brand} /> },
    { key: 'package', header: 'Package', sortable: true, className: 'text-sm' },
    {
      key: 'eventDate',
      header: 'Event date',
      sortable: true,
      className: 'text-sm',
      cell: (c) => (c.eventDate ? formatDate(c.eventDate) : '—'),
    },
    {
      key: 'credits',
      header: 'Credits',
      sortValue: (c) => (c.creditsTotal ? c.creditsUsed / c.creditsTotal : 0),
      sortable: true,
      cell: (c) => (
        <div className="w-24">
          <div className="mb-1 text-xs text-muted-foreground">{c.creditsUsed}/{c.creditsTotal}</div>
          <Progress value={c.creditsTotal ? (c.creditsUsed / c.creditsTotal) * 100 : 0} className="h-1.5" />
        </div>
      ),
    },
    {
      key: 'onboarding',
      header: 'Onboarding',
      sortable: true,
      cell: (c) => <Badge variant={c.onboarding === 'Acknowledged' ? 'secondary' : 'outline'}>{c.onboarding}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (c) => <Badge className={statusTone(c.status)} variant="secondary">{c.status}</Badge>,
    },
    {
      key: 'balance',
      header: 'Balance',
      sortable: true,
      headClassName: 'text-right',
      className: 'text-right font-medium',
      cell: (c) => (c.balance ? formatCurrency(c.balance) : '—'),
    },
    {
      key: 'actions',
      header: 'Actions',
      stopClick: true,
      headClassName: 'w-44 text-right',
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openDetail(c)}>
            <Eye className="size-3.5" />View
          </Button>
          {c.status === 'Active' && (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => scheduleMeeting(c)}>
              <CalendarPlus className="size-3.5" />Schedule
            </Button>
          )}
          <RowActions onEdit={() => startEdit(c)} onDelete={() => setDeleteTarget(c)} />
        </div>
      ),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [])

  const saveNow = () => {
    const payload = {
      ...form,
      creditsUsed: Number(form.creditsUsed) || 0,
      creditsTotal: Number(form.creditsTotal) || 0,
      balance: Number(form.balance) || 0,
    }
    if (editing) {
      // Always write against the FULL list — `clients` is scoped to the active
      // brand, so saving through it would drop the other brand's records.
      setClients(allClients.map((c) => (c.id === editing.id ? { ...c, ...payload } : c)))
      toast.success(`Client "${payload.name}" updated.`)
    } else {
      const id = `CL-${String(allClients.length + 1).padStart(2, '0')}`
      setClients([{ ...payload, id }, ...allClients])
      toast.success(`Client "${payload.name}" added.`)
    }
    setView('list')
  }

  const removeNow = () => {
    setClients(allClients.filter((c) => c.id !== deleteTarget.id))
    toast.success(`Client "${deleteTarget.name}" removed.`)
  }

  const brandPackages = packages.filter((p) => p.brand === form.brand)

  if (view === 'form') {
    return (
      <div className="max-w-5xl">
        <BackHeader
          title={editing ? 'Edit client' : 'New client'}
          description="In the live system these fields auto-fill from the client's intake form."
          backLabel="Back to clients"
          onBack={() => setView('list')}
        />
        <Card>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Client name</Label>
              <Input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Sarah & James Whitfield" />
            </div>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Select value={form.brand} onValueChange={(v) => setField('brand', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{packageBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Package</Label>
              <Select value={form.package} onValueChange={(v) => setField('package', v)}>
                <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
                <SelectContent>{brandPackages.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Event</Label>
              <Input value={form.event} onChange={(e) => setField('event', e.target.value)} placeholder="Whitfield Wedding" />
            </div>
            <div className="space-y-1.5">
              <Label>Event date</Label>
              <Input type="date" value={form.eventDate} onChange={(e) => setField('eventDate', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{clientStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Onboarding</Label>
              <Select value={form.onboarding} onValueChange={(v) => setField('onboarding', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Pending', 'Acknowledged'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Credits used</Label>
              <Input type="number" min={0} value={form.creditsUsed} onChange={(e) => setField('creditsUsed', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Credits total</Label>
              <Input type="number" min={0} value={form.creditsTotal} onChange={(e) => setField('creditsTotal', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Outstanding balance (USD)</Label>
              <Input type="number" min={0} value={form.balance} onChange={(e) => setField('balance', e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.name.trim()} onClick={() => setConfirmSave(true)}>
                <Check className="size-4" />{editing ? 'Save changes' : 'Add client'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={confirmSave}
          onOpenChange={setConfirmSave}
          title={editing ? 'Save changes?' : 'Add this client?'}
          description={`"${form.name || 'New client'}" will be ${editing ? 'updated' : 'added'} across the portal.`}
          confirmLabel={editing ? 'Save' : 'Add'}
          confirmVariant="default"
          onConfirm={saveNow}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clients"
        description="Every active client across both brands, with package, event and onboarding status."
        action={<Button className="gap-1.5" onClick={startAdd}><Plus className="size-4" />Add client</Button>}
      />

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Client-facing forms &amp; info</CardTitle>
          <CardDescription>The links clients receive along the journey — preview exactly what they see.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="gap-1.5">
            <a href="/intake" target="_blank" rel="noreferrer"><FileText className="size-4" />Intake form ↗</a>
          </Button>
          <Button asChild variant="outline" className="gap-1.5">
            <a href="/timeline-form" target="_blank" rel="noreferrer"><Clock className="size-4" />Wedding-day timeline form ↗</a>
          </Button>
          <Button asChild variant="outline" className="gap-1.5">
            <a href="/wedding-insurance" target="_blank" rel="noreferrer"><ShieldCheck className="size-4" />Wedding insurance ↗</a>
          </Button>
          <Button asChild variant="outline" className="gap-1.5">
            <a href="/welcome/family-affair" target="_blank" rel="noreferrer"><KeyRound className="size-4" />Client welcome / set password ↗</a>
          </Button>
        </CardContent>
      </Card>

      <DataTable
        title="All clients"
        columns={columns}
        rows={clients}
        onRowClick={openDetail}
        searchKeys={['name', 'email', 'phone', 'package', 'event']}
        searchPlaceholder="Search by name, email, package…"
        filters={[
          { key: 'brand', label: 'Brand', options: packageBrands },
          { key: 'status', label: 'Status', options: clientStatuses },
          { key: 'onboarding', label: 'Onboarding', options: ['Pending', 'Acknowledged'] },
        ]}
        emptyMessage="No clients yet — convert a booked lead to create one."
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this client?"
        description={deleteTarget ? `"${deleteTarget.name}" will be removed from the client list.` : ''}
        confirmLabel="Remove"
        onConfirm={removeNow}
      />
    </div>
  )
}
