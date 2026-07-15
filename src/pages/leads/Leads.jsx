import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BellRing, GripVertical, Mail, Phone, Plus, Send, Check, Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { BrandBadge } from '@/components/common/BrandBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { RowActions } from '@/components/common/RowActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { leads as initialLeads, leadStages, leadCommunications } from '@/data/leads'
import { packageBrands } from '@/data/packages'
import { addClient, getClients } from '@/lib/clients-store'
import { formatCurrency, formatDate, nextSequentialId } from '@/lib/utils'

const emptyLead = {
  name: '', brand: 'Family Affair', email: '', phone: '', eventType: '',
  source: '', stage: 'New Inquiry', assignedTo: '', value: '', nextFollowUp: '', notes: '',
}

function followUpStatus(lead) {
  if (!lead.nextFollowUp) return null
  const today = new Date().toISOString().slice(0, 10)
  if (lead.nextFollowUp < today) return 'overdue'
  if (lead.nextFollowUp === today) return 'today'
  return 'upcoming'
}

// A lead created within the last 7 days shows as "New".
function isNewLead(lead) {
  if (!lead.createdAt) return false
  return (Date.now() - new Date(lead.createdAt)) / 86400000 <= 7
}

// The lead → client journey. Each stage has a clear "next action" so the flow
// is obvious inside the portal.
const FLOW = [
  { stage: 'New Inquiry', short: 'Inquiry', action: 'Send initial email', next: 'Contacted',
    help: 'Welcome email with the Calendly booking link.', toast: (l) => `Initial email with Calendly link sent to ${l.name}. Moved to Contacted.` },
  { stage: 'Contacted', short: 'Contacted', action: 'Mark consultation booked', next: 'Consultation Scheduled',
    help: 'Client booked a call via Calendly.', toast: (l) => `Consultation booked with ${l.name}.` },
  { stage: 'Consultation Scheduled', short: 'Consultation', action: 'Send intake form', next: 'Proposal Sent',
    help: 'Client fills the intake form once — it auto-fills their profile, event details & contract.', toast: (l) => `Intake form link sent to ${l.name}. Their answers auto-populate the system.` },
  { stage: 'Proposal Sent', short: 'Proposal', action: 'Generate & send contract', next: 'Awaiting Approval',
    help: 'AI-drafts the contract from the intake form, then sends via Adobe Acrobat Sign.', toast: (l) => `Contract sent to ${l.name} for e-signature.` },
  { stage: 'Awaiting Approval', short: 'Deposit', action: 'Record deposit paid', next: 'Booked',
    help: 'Contract signed + deposit received.', toast: (l) => `Deposit recorded — ${l.name} is booked!` },
  { stage: 'Booked', short: 'Client', action: 'Convert to client', next: null,
    help: 'Create the client profile, assign the package and send portal login.', toast: (l) => `${l.name} converted to a client — portal access created.` },
]

export default function Leads() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState(initialLeads)
  const [communications, setCommunications] = useState(leadCommunications)
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyLead)
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [detailId, setDetailId] = useState(null)
  const [dragOverStage, setDragOverStage] = useState(null)
  const [commType, setCommType] = useState('Call')
  const [commSummary, setCommSummary] = useState('')

  const detailLead = leads.find((l) => l.id === detailId) ?? null
  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  const startAdd = () => { setEditing(null); setForm(emptyLead); setView('form') }
  const startEdit = (lead) => { setEditing(lead); setForm({ ...lead, value: String(lead.value ?? '') }); setView('form') }
  const openDetail = (id) => { setDetailId(id); setView('detail') }

  const dueFollowUps = useMemo(
    () => leads.filter((l) => ['overdue', 'today'].includes(followUpStatus(l)))
      .sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp)),
    [leads]
  )

  const saveNow = () => {
    const payload = { ...form, value: Number(form.value) || 0 }
    if (editing) {
      setLeads((prev) => prev.map((l) => (l.id === editing.id ? { ...l, ...payload } : l)))
      toast.success(`Lead "${payload.name}" updated.`)
    } else {
      const newLead = { ...payload, id: nextSequentialId(leads, 'L'), createdAt: new Date().toISOString().slice(0, 10) }
      setLeads((prev) => [newLead, ...prev])
      toast.success(`Lead "${payload.name}" added.`)
    }
    setView('list')
  }

  const removeNow = () => {
    setLeads((prev) => prev.filter((l) => l.id !== deleteTarget.id))
    toast.success(`Lead "${deleteTarget.name}" deleted.`)
    if (detailId === deleteTarget.id) setView('list')
  }

  const moveLeadToStage = (leadId, stage) => {
    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.stage === stage) return
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage } : l)))
    toast.success(`"${lead.name}" moved to ${stage}.`)
  }

  const sendReminder = (lead) => toast.success(`Follow-up reminder sent to ${lead.assignedTo} for "${lead.name}".`)

  const advanceFlow = (lead) => {
    const step = FLOW.find((s) => s.stage === lead.stage)
    if (!step) return
    // Final step: create a real client record in the Clients module.
    if (step.next === null) {
      if (lead.converted) return
      const id = `CL-${String(getClients().length + 1).padStart(2, '0')}`
      addClient({
        id, name: lead.name, brand: lead.brand, email: lead.email, phone: lead.phone,
        package: '', event: lead.eventType || '', eventDate: '', status: 'Active',
        onboarding: 'Pending', creditsUsed: 0, creditsTotal: 0, balance: 0,
      })
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, converted: true } : l)))
      toast.success(step.toast(lead))
      return
    }
    toast.success(step.toast(lead))
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, stage: step.next } : l)))
  }

  const addCommunication = (leadId) => {
    if (!commSummary.trim()) return
    setCommunications((prev) => ({
      ...prev,
      [leadId]: [...(prev[leadId] ?? []), {
        id: `C-${(prev[leadId]?.length ?? 0) + 1}`, type: commType,
        summary: commSummary.trim(), date: new Date().toISOString().slice(0, 10), by: 'You',
      }],
    }))
    setCommSummary('')
    toast.success('Communication logged.')
  }

  // Newest leads always on top of the list.
  const displayLeads = [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

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

  // =================== IN-PAGE DETAIL ===================
  if (view === 'detail' && detailLead) {
    const status = followUpStatus(detailLead)
    const comms = communications[detailLead.id] ?? []
    return (
      <div className="max-w-4xl">
        <BackHeader title={detailLead.name} backLabel="Back to leads" onBack={() => setView('list')}
          description={`${detailLead.eventType || 'Lead'} · ${detailLead.source || '—'} · Created ${formatDate(detailLead.createdAt)}`} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <BrandBadge brand={detailLead.brand} />
            <Badge variant="outline">{detailLead.stage}</Badge>
            <Badge variant="secondary">{formatCurrency(detailLead.value)}</Badge>
            {status && ['overdue', 'today'].includes(status) && (
              <Badge variant={status === 'overdue' ? 'destructive' : 'secondary'}>
                <BellRing className="size-3" /> Follow-up {status === 'overdue' ? 'overdue' : 'due today'}
              </Badge>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => startEdit(detailLead)}>Edit</Button>
              <Button variant="destructive" onClick={() => setDeleteTarget(detailLead)}>Delete</Button>
            </div>
          </div>

          {(() => {
            const stageIndex = FLOW.findIndex((s) => s.stage === detailLead.stage)
            const step = FLOW.find((s) => s.stage === detailLead.stage)
            return (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Workflow — next step</CardTitle>
                  <CardDescription>From website inquiry through to a booked client</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {FLOW.map((s, i) => (
                      <div key={s.stage} className="flex items-center gap-1.5">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium',
                          i < stageIndex ? 'bg-primary/15 text-primary'
                            : i === stageIndex ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground')}>
                          {s.short}
                        </span>
                        {i < FLOW.length - 1 && <span className="text-muted-foreground/40">→</span>}
                      </div>
                    ))}
                  </div>
                  {detailLead.converted ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                        <Check className="size-4" /> Converted to client — profile created in Clients.
                      </p>
                      <Button variant="outline" className="shrink-0" onClick={() => navigate('/admin/clients')}>View in Clients</Button>
                    </div>
                  ) : step ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-card p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Next: {step.action}</p>
                        <p className="text-xs text-muted-foreground">{step.help}</p>
                      </div>
                      <Button className="shrink-0 gap-1.5" onClick={() => advanceFlow(detailLead)}>{step.action}</Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">This lead is closed — no further steps.</p>
                  )}
                  <a href="/intake" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    Preview the client intake form ↗
                  </a>
                </CardContent>
              </Card>
            )
          })()}

          <Card>
            <CardContent className="grid gap-3 p-6 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" />{detailLead.email || '—'}</p>
              <p className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" />{detailLead.phone || '—'}</p>
              <p className="text-muted-foreground">Assigned to <span className="font-medium text-foreground">{detailLead.assignedTo || '—'}</span></p>
              <p className="text-muted-foreground">Next follow-up <span className="font-medium text-foreground">{detailLead.nextFollowUp ? formatDate(detailLead.nextFollowUp) : '—'}</span></p>
              {detailLead.notes && <p className="rounded-lg bg-muted/50 p-3 sm:col-span-2">{detailLead.notes}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Communication history</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {comms.length === 0 ? (
                <p className="text-sm text-muted-foreground">No communications logged yet.</p>
              ) : (
                <ol className="relative flex flex-col gap-3 border-l border-border pl-4">
                  {comms.map((entry) => (
                    <li key={entry.id} className="relative">
                      <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-card bg-primary" />
                      <p className="text-sm"><span className="font-medium">{entry.type}</span>
                        <span className="text-muted-foreground"> · {formatDate(entry.date)} · {entry.by}</span></p>
                      <p className="text-sm text-muted-foreground">{entry.summary}</p>
                    </li>
                  ))}
                </ol>
              )}
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <Label className="text-sm font-semibold">Log communication</Label>
                <div className="flex flex-wrap gap-2">
                  <Select value={commType} onValueChange={setCommType}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{['Call', 'Email', 'Meeting', 'Text'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input className="min-w-48 flex-1" value={commSummary} onChange={(e) => setCommSummary(e.target.value)} placeholder="What was discussed?" />
                  <Button onClick={() => addCommunication(detailLead.id)}>Add entry</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete this lead?"
          description={deleteTarget ? `"${deleteTarget.name}" will be removed from the pipeline.` : ''}
          onConfirm={removeNow}
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

      {dueFollowUps.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><BellRing className="size-4 text-amber-600" />Follow-ups due</CardTitle>
            <CardDescription>{dueFollowUps.length} lead{dueFollowUps.length > 1 ? 's' : ''} need attention today</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {dueFollowUps.map((lead) => (
              <div key={lead.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
                <div className="min-w-0">
                  <button type="button" className="truncate text-sm font-medium hover:underline" onClick={() => openDetail(lead.id)}>{lead.name}</button>
                  <p className="text-xs text-muted-foreground">{lead.brand} · {lead.stage} · {lead.assignedTo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={followUpStatus(lead) === 'overdue' ? 'destructive' : 'secondary'}>
                    {followUpStatus(lead) === 'overdue' ? `Overdue · ${formatDate(lead.nextFollowUp)}` : 'Due today'}
                  </Badge>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => sendReminder(lead)}><Send className="size-3.5" />Remind</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
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
                      onClick={() => openDetail(lead.id)}
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
          <Card>
            <CardHeader>
              <CardTitle>All leads</CardTitle>
              <CardDescription>{leads.length} on record</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Event type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Assigned to</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button type="button" className="text-left font-medium hover:underline" onClick={() => openDetail(lead.id)}>{lead.name}</button>
                          {isNewLead(lead)
                            ? <Badge variant="secondary" className="bg-emerald-500/15 px-1.5 text-[10px] font-semibold text-emerald-600">New</Badge>
                            : <span className="text-[10px] text-muted-foreground">{formatDate(lead.createdAt)}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{lead.email}</p>
                      </TableCell>
                      <TableCell><BrandBadge brand={lead.brand} /></TableCell>
                      <TableCell>{lead.eventType}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.source}</TableCell>
                      <TableCell><Badge variant="outline">{lead.stage}</Badge></TableCell>
                      <TableCell>{lead.assignedTo}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(lead.value)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openDetail(lead.id)}>
                            <Eye className="size-3.5" />View
                          </Button>
                          <RowActions onEdit={() => startEdit(lead)} onDelete={() => setDeleteTarget(lead)} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
