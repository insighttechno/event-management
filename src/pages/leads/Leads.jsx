import { useMemo, useState } from 'react'
import { BellRing, GripVertical, Mail, Phone, Plus, Send } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
import { EntityFormDialog } from '@/components/common/EntityFormDialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { RowActions } from '@/components/common/RowActions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { leadStages } from '@/data/leads'
import { leadsService } from '@/services/leads'
import { formatCurrency, formatDate } from '@/lib/utils'

const leadFields = [
  { name: 'name', label: 'Client name', span: 'full', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone' },
  { name: 'eventType', label: 'Event type' },
  { name: 'source', label: 'Source' },
  { name: 'stage', label: 'Stage', type: 'select', options: leadStages },
  { name: 'assignedTo', label: 'Assigned to' },
  { name: 'value', label: 'Estimated value', type: 'number', min: 0 },
  { name: 'nextFollowUp', label: 'Next follow-up', type: 'date' },
  { name: 'notes', label: 'Notes', type: 'textarea', span: 'full' },
]

const emptyLead = {
  name: '',
  email: '',
  phone: '',
  eventType: '',
  source: '',
  stage: 'New Inquiry',
  assignedTo: '',
  value: '',
  nextFollowUp: '',
  notes: '',
}

function followUpStatus(lead) {
  if (!lead.nextFollowUp) return null
  const today = new Date().toISOString().slice(0, 10)
  if (lead.nextFollowUp < today) return 'overdue'
  if (lead.nextFollowUp === today) return 'today'
  return 'upcoming'
}

export default function Leads() {
  const [leads, setLeads] = useState(() => leadsService.list())
  // Bumped after logging a communication so the detail sheet re-reads the service.
  const [, setCommsVersion] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [detailLeadId, setDetailLeadId] = useState(null)
  const [dragOverStage, setDragOverStage] = useState(null)

  const detailLead = leads.find((lead) => lead.id === detailLeadId) ?? null

  const dueFollowUps = useMemo(
    () =>
      leads
        .filter((lead) => ['overdue', 'today'].includes(followUpStatus(lead)))
        .sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp)),
    [leads]
  )

  const openAddDialog = () => {
    setEditingLead(null)
    setFormOpen(true)
  }

  const openEditDialog = (lead) => {
    setEditingLead(lead)
    setFormOpen(true)
  }

  const handleSubmit = (values) => {
    const payload = { ...values, value: Number(values.value) || 0 }

    if (editingLead) {
      leadsService.update(editingLead.id, payload)
      toast.success(`Lead "${payload.name}" updated.`)
    } else {
      leadsService.create({
        ...payload,
        createdAt: new Date().toISOString().slice(0, 10),
      })
      toast.success(`Lead "${payload.name}" added.`)
    }
    setLeads(leadsService.list())
  }

  const handleDelete = () => {
    leadsService.remove(deleteTarget.id)
    setLeads(leadsService.list())
    toast.success(`Lead "${deleteTarget.name}" deleted.`)
  }

  const moveLeadToStage = (leadId, stage) => {
    const lead = leads.find((item) => item.id === leadId)
    if (!lead || lead.stage === stage) return
    leadsService.update(leadId, { stage })
    setLeads(leadsService.list())
    toast.success(`"${lead.name}" moved to ${stage}.`)
  }

  const sendReminder = (lead) => {
    toast.success(`Follow-up reminder sent to ${lead.assignedTo} for "${lead.name}".`)
  }

  const addCommunication = (leadId, entry) => {
    leadsService.addCommunication(leadId, entry)
    setCommsVersion((v) => v + 1)
    toast.success('Communication logged.')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leads & Inquiries"
        description="Track inquiries from first contact through booking, across both businesses."
        action={
          <Button onClick={openAddDialog} className="gap-1.5">
            <Plus className="size-4" />
            Add Lead
          </Button>
        }
      />

      {dueFollowUps.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="size-4 text-amber-600" />
              Follow-ups due
            </CardTitle>
            <CardDescription>
              {dueFollowUps.length} lead{dueFollowUps.length > 1 ? 's' : ''} need attention today
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {dueFollowUps.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="min-w-0">
                  <button
                    type="button"
                    className="truncate text-sm font-medium hover:underline"
                    onClick={() => setDetailLeadId(lead.id)}
                  >
                    {lead.name}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {lead.stage} · assigned to {lead.assignedTo}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={followUpStatus(lead) === 'overdue' ? 'destructive' : 'secondary'}
                  >
                    {followUpStatus(lead) === 'overdue'
                      ? `Overdue · ${formatDate(lead.nextFollowUp)}`
                      : 'Due today'}
                  </Badge>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => sendReminder(lead)}>
                    <Send className="size-3.5" />
                    Remind
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="board">Pipeline Board</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          <div className="flex gap-3 overflow-x-auto pb-3">
            {leadStages.map((stage) => {
              const stageLeads = leads.filter((lead) => lead.stage === stage)
              return (
                <div
                  key={stage}
                  className={cn(
                    'flex w-64 shrink-0 flex-col gap-2 rounded-xl border border-border bg-muted/40 p-2 transition-colors',
                    dragOverStage === stage && 'border-primary bg-primary/5'
                  )}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragOverStage(stage)
                  }}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={(event) => {
                    event.preventDefault()
                    setDragOverStage(null)
                    moveLeadToStage(event.dataTransfer.getData('text/plain'), stage)
                  }}
                >
                  <div className="flex items-center justify-between px-2 pt-1">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {stage}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {stageLeads.length}
                    </Badge>
                  </div>

                  {stageLeads.map((lead) => {
                    const status = followUpStatus(lead)
                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(event) =>
                          event.dataTransfer.setData('text/plain', lead.id)
                        }
                        onClick={() => setDetailLeadId(lead.id)}
                        className="group cursor-grab rounded-lg border border-border bg-card p-3 shadow-xs transition-shadow hover:shadow-sm active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-sm leading-tight font-medium">{lead.name}</p>
                          <GripVertical className="size-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground" />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{lead.eventType}</p>
                        <div className="mt-2 flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold">
                            {formatCurrency(lead.value)}
                          </span>
                          {status && ['overdue', 'today'].includes(status) && (
                            <Badge
                              variant={status === 'overdue' ? 'destructive' : 'secondary'}
                              className="px-1.5 text-[10px]"
                            >
                              <BellRing className="size-3" />
                              {status === 'overdue' ? 'Overdue' : 'Today'}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">{lead.assignedTo}</p>
                      </div>
                    )
                  })}

                  {stageLeads.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border px-2 py-6 text-center text-xs text-muted-foreground">
                      Drop leads here
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>{leads.length} leads on record</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => {
                    const status = followUpStatus(lead)
                    return (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <button
                            type="button"
                            className="text-left font-medium hover:underline"
                            onClick={() => setDetailLeadId(lead.id)}
                          >
                            {lead.name}
                          </button>
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        </TableCell>
                        <TableCell>{lead.eventType}</TableCell>
                        <TableCell>{lead.source}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.stage}</Badge>
                        </TableCell>
                        <TableCell>{lead.assignedTo}</TableCell>
                        <TableCell>
                          {lead.nextFollowUp ? (
                            <Badge
                              variant={
                                status === 'overdue'
                                  ? 'destructive'
                                  : status === 'today'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {formatDate(lead.nextFollowUp)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(lead.value)}
                        </TableCell>
                        <TableCell>
                          <RowActions
                            onEdit={() => openEditDialog(lead)}
                            onDelete={() => setDeleteTarget(lead)}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <LeadDetailSheet
        lead={detailLead}
        communications={detailLead ? leadsService.communicationsFor(detailLead.id) : []}
        onOpenChange={(open) => !open && setDetailLeadId(null)}
        onEdit={() => {
          openEditDialog(detailLead)
          setDetailLeadId(null)
        }}
        onAddCommunication={addCommunication}
        onSendReminder={sendReminder}
      />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingLead ? 'Edit Lead' : 'Add Lead'}
        description={
          editingLead
            ? 'Update this inquiry and save your changes.'
            : 'Add a new inquiry to the pipeline.'
        }
        fields={leadFields}
        defaultValues={editingLead ?? emptyLead}
        onSubmit={handleSubmit}
        submitLabel={editingLead ? 'Save changes' : 'Add lead'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this lead?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed from the pipeline. This cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
      />
    </div>
  )
}

function LeadDetailSheet({
  lead,
  communications,
  onOpenChange,
  onEdit,
  onAddCommunication,
  onSendReminder,
}) {
  const [commType, setCommType] = useState('Call')
  const [commSummary, setCommSummary] = useState('')

  const logCommunication = (event) => {
    event.preventDefault()
    if (!commSummary.trim()) return
    onAddCommunication(lead.id, {
      type: commType,
      summary: commSummary.trim(),
      date: new Date().toISOString().slice(0, 10),
      by: 'You',
    })
    setCommSummary('')
  }

  const status = lead ? followUpStatus(lead) : null

  return (
    <Sheet open={!!lead} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {lead && (
          <>
            <SheetHeader>
              <SheetTitle>{lead.name}</SheetTitle>
              <SheetDescription>
                {lead.eventType} · {lead.source} · Created {formatDate(lead.createdAt)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 px-4 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{lead.stage}</Badge>
                <Badge variant="secondary">{formatCurrency(lead.value)}</Badge>
                {status && ['overdue', 'today'].includes(status) && (
                  <Badge variant={status === 'overdue' ? 'destructive' : 'secondary'}>
                    <BellRing className="size-3" />
                    Follow-up {status === 'overdue' ? 'overdue' : 'due today'}
                  </Badge>
                )}
              </div>

              <div className="grid gap-2 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  {lead.email || '—'}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  {lead.phone || '—'}
                </p>
                <p className="text-muted-foreground">
                  Assigned to <span className="font-medium text-foreground">{lead.assignedTo}</span>
                  {lead.nextFollowUp && <> · Next follow-up {formatDate(lead.nextFollowUp)}</>}
                </p>
              </div>

              {lead.notes && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">{lead.notes}</div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={onEdit}>
                  Edit lead
                </Button>
                {status && ['overdue', 'today'].includes(status) && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onSendReminder(lead)}>
                    <Send className="size-3.5" />
                    Send reminder
                  </Button>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Communication history</h3>
                {communications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No communications logged yet.</p>
                ) : (
                  <ol className="relative flex flex-col gap-3 border-l border-border pl-4">
                    {communications.map((entry) => (
                      <li key={entry.id} className="relative">
                        <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-card bg-primary" />
                        <p className="text-sm">
                          <span className="font-medium">{entry.type}</span>
                          <span className="text-muted-foreground">
                            {' '}
                            · {formatDate(entry.date)} · {entry.by}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">{entry.summary}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <form onSubmit={logCommunication} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Log communication</h3>
                <div className="flex gap-2">
                  <Select value={commType} onValueChange={setCommType}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Call', 'Email', 'Meeting', 'Text'].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={commSummary}
                    onChange={(event) => setCommSummary(event.target.value)}
                    placeholder="What was discussed?"
                  />
                </div>
                <Button type="submit" size="sm" className="self-start">
                  Add entry
                </Button>
              </form>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
