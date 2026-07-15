import { useMemo, useState, useSyncExternalStore } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { BellRing, GripVertical, Plus, Send, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { BrandBadge } from '@/components/common/BrandBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ALL_FILTER, DataTable } from '@/components/common/DataTable'
import { RowActions } from '@/components/common/RowActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { leadStages } from '@/data/leads'
import { packageBrands } from '@/data/packages'
import { followUpStatus, isNewLead } from '@/lib/lead-flow'
import {
  addLead, getLeads, removeLead, subscribeLeads, updateLead,
} from '@/lib/leads-store'
import { formatCurrency, formatDate, nextSequentialId } from '@/lib/utils'

const emptyLead = {
  name: '', brand: 'Family Affair', email: '', phone: '', eventType: '',
  source: '', stage: 'New Inquiry', assignedTo: '', value: '', nextFollowUp: '', notes: '',
}

export default function Leads() {
  const navigate = useNavigate()
  const location = useLocation()
  const leads = useSyncExternalStore(subscribeLeads, getLeads)

  // The detail page sends us here to edit — open straight into the form rather
  // than making the user find the row again.
  const editIdFromNav = location.state?.editId
  const leadFromNav = editIdFromNav ? getLeads().find((l) => l.id === editIdFromNav) : null

  const [view, setView] = useState(leadFromNav ? 'form' : 'list')
  const [editing, setEditing] = useState(leadFromNav)
  const [form, setForm] = useState(() =>
    leadFromNav ? { ...leadFromNav, value: String(leadFromNav.value ?? '') } : emptyLead
  )
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [dragOverStage, setDragOverStage] = useState(null)

  // Filters live in the URL, so a filtered view is bookmarkable, linkable from
  // the dashboard and survives a refresh. The table is CONTROLLED from here so
  // the strip button and the Follow-up dropdown can never disagree — they set
  // the same single value.
  const [searchParams, setSearchParams] = useSearchParams()
  const filterValues = Object.fromEntries(searchParams)

  const handleFilterChange = (next) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(next)) {
      if (value && value !== ALL_FILTER) params.set(key, value)
    }
    setSearchParams(params)
  }

  const followUpOnly = filterValues.followUp === 'due'
  const toggleFollowUps = () =>
    handleFilterChange({ ...filterValues, followUp: followUpOnly ? undefined : 'due' })

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  const startAdd = () => { setEditing(null); setForm(emptyLead); setView('form') }
  const startEdit = (lead) => { setEditing(lead); setForm({ ...lead, value: String(lead.value ?? '') }); setView('form') }
  const openDetail = (lead) => navigate(`/admin/leads/${lead.id}`)

  const dueFollowUps = useMemo(
    () => leads.filter((l) => ['overdue', 'today'].includes(followUpStatus(l)))
      .sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp)),
    [leads]
  )

  // Newest leads always on top of the list.
  const displayLeads = useMemo(
    () => [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [leads]
  )


  const saveNow = () => {
    const payload = { ...form, value: Number(form.value) || 0 }
    if (editing) {
      updateLead(editing.id, payload)
      toast.success(`Lead "${payload.name}" updated.`)
    } else {
      addLead({ ...payload, id: nextSequentialId(leads, 'L'), createdAt: new Date().toISOString().slice(0, 10) })
      toast.success(`Lead "${payload.name}" added.`)
    }
    setView('list')
  }

  const removeNow = () => {
    removeLead(deleteTarget.id)
    toast.success(`Lead "${deleteTarget.name}" deleted.`)
  }

  const moveLeadToStage = (leadId, stage) => {
    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.stage === stage) return
    updateLead(leadId, { stage })
    toast.success(`"${lead.name}" moved to ${stage}.`)
  }

  const sendReminder = (lead) => toast.success(`Follow-up reminder sent to ${lead.assignedTo} for "${lead.name}".`)

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Lead',
      sortable: true,
      // Event type sits under the name instead of taking its own column, and
      // email/source moved to the detail page — the admin team works on small
      // laptops and horizontal scrolling was hurting them.
      cell: (lead) => (
        <>
          <div className="flex items-center gap-2">
            <span className="font-medium">{lead.name}</span>
            {isNewLead(lead)
              ? <Badge variant="secondary" className="bg-emerald-500/15 px-1.5 text-[10px] font-semibold text-emerald-600">New</Badge>
              : <span className="text-[10px] text-muted-foreground">{formatDate(lead.createdAt)}</span>}
          </div>
          <p className="text-xs text-muted-foreground">{lead.eventType || '—'}</p>
        </>
      ),
    },
    { key: 'brand', header: 'Brand', sortable: true, cell: (lead) => <BrandBadge brand={lead.brand} /> },
    { key: 'stage', header: 'Stage', sortable: true, cell: (lead) => <Badge variant="outline">{lead.stage}</Badge> },
    { key: 'assignedTo', header: 'Assigned to', sortable: true },
    {
      key: 'nextFollowUp',
      header: 'Follow-up',
      sortable: true,
      cell: (lead) => {
        const status = followUpStatus(lead)
        if (!lead.nextFollowUp) return <span className="text-xs text-muted-foreground">—</span>
        if (status === 'overdue') {
          return <Badge variant="destructive" className="text-[10px]">Overdue · {formatDate(lead.nextFollowUp)}</Badge>
        }
        if (status === 'today') {
          return <Badge variant="secondary" className="bg-amber-500/15 text-[10px] text-amber-700">Due today</Badge>
        }
        return <span className="text-sm text-muted-foreground">{formatDate(lead.nextFollowUp)}</span>
      },
    },
    {
      key: 'value',
      header: 'Value',
      sortable: true,
      headClassName: 'text-right',
      className: 'text-right font-medium',
      cell: (lead) => formatCurrency(lead.value),
    },
    {
      key: 'actions',
      header: 'Actions',
      stopClick: true,
      headClassName: 'w-28 text-right',
      // No "View" button — the whole row already opens the lead, so it was
      // just costing width.
      cell: (lead) => (
        <div className="flex items-center justify-end gap-1">
          {/* Remind only where it's actually actionable — kept from the old
              follow-ups card so nothing was lost when it became a strip. */}
          {['overdue', 'today'].includes(followUpStatus(lead)) && (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => sendReminder(lead)}>
              <Send className="size-3.5" />Remind
            </Button>
          )}
          <RowActions
            onView={() => openDetail(lead)}
            onEdit={() => startEdit(lead)}
            onDelete={() => setDeleteTarget(lead)}
          />
        </div>
      ),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [])

  // =================== IN-PAGE FORM ===================
  if (view === 'form') {
    return (
      <div className="max-w-5xl">
        <BackHeader
          title={editing ? 'Edit lead' : 'New lead'}
          description="Capture an inquiry and place it in the pipeline. Website inquiries land here automatically."
          backLabel="Back to leads"
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
              <Label>Event type</Label>
              <Input value={form.eventType} onChange={(e) => setField('eventType', e.target.value)} placeholder="Wedding / Engagement Shoot" />
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
              <Label>Source</Label>
              <Input value={form.source} onChange={(e) => setField('source', e.target.value)} placeholder="Website / Instagram / Referral" />
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => setField('stage', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{leadStages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assigned to</Label>
              <Input value={form.assignedTo} onChange={(e) => setField('assignedTo', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Estimated value (USD)</Label>
              <Input type="number" min={0} value={form.value} onChange={(e) => setField('value', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Next follow-up</Label>
              <Input type="date" value={form.nextFollowUp} onChange={(e) => setField('nextFollowUp', e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea rows={4} value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.name.trim()} onClick={() => setConfirmSave(true)}>
                <Check className="size-4" />{editing ? 'Save changes' : 'Add lead'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={confirmSave}
          onOpenChange={setConfirmSave}
          title={editing ? 'Save changes?' : 'Add this lead?'}
          description={`"${form.name || 'New lead'}" will be ${editing ? 'updated' : 'added to the pipeline'}.`}
          confirmLabel={editing ? 'Save' : 'Add'}
          confirmVariant="default"
          onConfirm={saveNow}
        />
      </div>
    )
  }

  // =================== LIST ===================
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leads & Inquiries"
        description="Track inquiries from first contact through booking — across both brands."
        action={<Button className="gap-1.5" onClick={startAdd}><Plus className="size-4" />Add lead</Button>}
      />

      {/* One line, not a card — the leads table stays the hero, but a due
          follow-up is still impossible to walk past. Also renders when the
          filter is on but nothing is due (a stale bookmarked URL), otherwise
          there'd be no way back to all leads. */}
      {(dueFollowUps.length > 0 || followUpOnly) && (
        <div
          className={cn(
            'flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2.5',
            dueFollowUps.length > 0
              ? 'border-amber-500/40 bg-amber-500/5'
              : 'border-border bg-muted/40'
          )}
        >
          <BellRing
            className={cn(
              'size-4 shrink-0',
              dueFollowUps.length > 0 ? 'text-amber-600' : 'text-muted-foreground'
            )}
          />
          <p className="min-w-0 flex-1 text-sm">
            {dueFollowUps.length > 0 ? (
              <>
                <span className="font-medium">
                  {dueFollowUps.length} follow-up{dueFollowUps.length > 1 ? 's' : ''} due
                </span>
                <span className="text-muted-foreground">
                  {' '}— {dueFollowUps.slice(0, 3).map((l) => l.name).join(', ')}
                  {dueFollowUps.length > 3 && ` +${dueFollowUps.length - 3} more`}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Nothing needs following up right now.</span>
            )}
          </p>
          <Button
            size="sm"
            variant={followUpOnly ? 'default' : 'outline'}
            className="shrink-0"
            onClick={toggleFollowUps}
          >
            {followUpOnly ? 'Show all leads' : 'Show these'}
          </Button>
        </div>
      )}

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table view</TabsTrigger>
          <TabsTrigger value="board">Pipeline board</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          <div className="flex gap-3 overflow-x-auto pb-3">
            {leadStages.map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage)
              return (
                <div key={stage}
                  className={cn('flex w-64 shrink-0 flex-col gap-2 rounded-xl border border-border bg-muted/40 p-2 transition-colors',
                    dragOverStage === stage && 'border-primary bg-primary/5')}
                  onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage) }}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={(e) => { e.preventDefault(); setDragOverStage(null); moveLeadToStage(e.dataTransfer.getData('text/plain'), stage) }}
                >
                  <div className="flex items-center justify-between px-2 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stage}</p>
                    <Badge variant="secondary">{stageLeads.length}</Badge>
                  </div>
                  {stageLeads.map((lead) => (
                    <div key={lead.id} draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', lead.id)}
                      onClick={() => openDetail(lead)}
                      className="group cursor-grab rounded-lg border border-border bg-card p-3 shadow-xs transition-shadow hover:shadow-sm active:cursor-grabbing">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <p className="truncate text-sm font-medium leading-tight">{lead.name}</p>
                          {isNewLead(lead) && <Badge variant="secondary" className="shrink-0 bg-emerald-500/15 px-1 text-[9px] font-semibold text-emerald-600">New</Badge>}
                        </div>
                        <GripVertical className="size-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground" />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{lead.eventType}</p>
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold">{formatCurrency(lead.value)}</span>
                        <BrandBadge brand={lead.brand} className="px-1.5 text-[10px]" />
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border px-2 py-6 text-center text-xs text-muted-foreground">Drop leads here</p>
                  )}
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <DataTable
            title={followUpOnly ? 'Follow-ups due' : 'All leads'}
            columns={columns}
            rows={displayLeads}
            onRowClick={openDetail}
            searchKeys={['name', 'email', 'phone', 'eventType', 'source', 'assignedTo']}
            searchPlaceholder="Search by name, email, event type…"
            filterValues={filterValues}
            onFilterValuesChange={handleFilterChange}
            filters={[
              { key: 'brand', label: 'Brand', options: packageBrands },
              { key: 'stage', label: 'Stage', options: leadStages },
              {
                key: 'followUp',
                label: 'Follow-up',
                options: [
                  { label: 'Due now (overdue + today)', value: 'due' },
                  { label: 'Overdue', value: 'overdue' },
                  { label: 'Due today', value: 'today' },
                  { label: 'Upcoming', value: 'upcoming' },
                  { label: 'No follow-up set', value: 'none' },
                ],
                match: (lead, value) => {
                  const s = followUpStatus(lead)
                  if (value === 'due') return ['overdue', 'today'].includes(s)
                  if (value === 'none') return s === null
                  return s === value
                },
              },
            ]}
            emptyMessage="No leads yet — inquiries from the website land here."
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this lead?"
        description={deleteTarget ? `"${deleteTarget.name}" will be removed from the pipeline. This cannot be undone.` : ''}
        onConfirm={removeNow}
      />
    </div>
  )
}
