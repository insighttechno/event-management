import { useState, useSyncExternalStore } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BellRing, Check, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { BackHeader } from '@/components/common/BackHeader'
import { BrandBadge } from '@/components/common/BrandBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { FLOW, followUpStatus } from '@/lib/lead-flow'
import {
  addCommunication, getCommunications, getLeads, removeLead, subscribeLeads, updateLead,
} from '@/lib/leads-store'
import { addClient, getClients } from '@/lib/clients-store'
import { formatCurrency, formatDate } from '@/lib/utils'

// One labelled fact. Empty reads as "—" rather than a blank gap, so the team
// can tell "not filled in" apart from "didn't render".
function Field({ label, value, icon: Icon, href, mono, tone }) {
  const empty = value == null || value === ''
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="mt-1 flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
        {href && !empty ? (
          <a href={href} className="text-sm font-medium text-primary hover:underline">{value}</a>
        ) : (
          <span
            className={cn(
              'text-sm',
              empty ? 'text-muted-foreground' : 'font-medium',
              mono && !empty && 'font-mono',
              tone === 'urgent' && !empty && 'text-destructive'
            )}
          >
            {empty ? '—' : value}
          </span>
        )}
      </div>
    </div>
  )
}

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const leads = useSyncExternalStore(subscribeLeads, getLeads)
  const communications = useSyncExternalStore(subscribeLeads, getCommunications)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [commType, setCommType] = useState('Call')
  const [commSummary, setCommSummary] = useState('')

  const lead = leads.find((l) => l.id === id)

  if (!lead) {
    return (
      <div className="max-w-4xl">
        <BackHeader
          title="Lead not found"
          description="This lead may have been deleted."
          backLabel="Back to leads"
          onBack={() => navigate('/admin/leads')}
        />
      </div>
    )
  }

  const status = followUpStatus(lead)
  const comms = communications[lead.id] ?? []
  const stageIndex = FLOW.findIndex((s) => s.stage === lead.stage)
  const step = FLOW.find((s) => s.stage === lead.stage)

  const advanceFlow = () => {
    if (!step) return
    // Final step: create a real client record in the Clients module.
    if (step.next === null) {
      if (lead.converted) return
      const clientId = `CL-${String(getClients().length + 1).padStart(2, '0')}`
      addClient({
        id: clientId, name: lead.name, brand: lead.brand, email: lead.email, phone: lead.phone,
        package: '', event: lead.eventType || '', eventDate: '', status: 'Active',
        onboarding: 'Pending', creditsUsed: 0, creditsTotal: 0, balance: 0,
      })
      updateLead(lead.id, { converted: true })
      toast.success(step.toast(lead))
      return
    }
    toast.success(step.toast(lead))
    updateLead(lead.id, { stage: step.next })
  }

  const logCommunication = () => {
    if (!commSummary.trim()) return
    addCommunication(lead.id, {
      type: commType,
      summary: commSummary.trim(),
      date: new Date().toISOString().slice(0, 10),
      by: 'You',
    })
    setCommSummary('')
    toast.success('Communication logged.')
  }

  const removeNow = () => {
    removeLead(lead.id)
    toast.success(`Lead "${lead.name}" deleted.`)
    navigate('/admin/leads')
  }

  return (
    <div className="max-w-4xl">
      <BackHeader
        title={lead.name}
        backLabel="Back to leads"
        onBack={() => navigate('/admin/leads')}
        description={`${lead.eventType || 'Lead'} · ${lead.source || '—'} · Created ${formatDate(lead.createdAt)}`}
      />

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <BrandBadge brand={lead.brand} />
          <Badge variant="outline">{lead.stage}</Badge>
          <Badge variant="secondary">{formatCurrency(lead.value)}</Badge>
          {status && ['overdue', 'today'].includes(status) && (
            <Badge variant={status === 'overdue' ? 'destructive' : 'secondary'}>
              <BellRing className="size-3" /> Follow-up {status === 'overdue' ? 'overdue' : 'due today'}
            </Badge>
          )}
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/leads', { state: { editId: lead.id } })}
            >
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete</Button>
          </div>
        </div>

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
            {lead.converted ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                  <Check className="size-4" /> Converted to client — profile created in Clients.
                </p>
                <Button variant="outline" className="shrink-0" onClick={() => navigate('/admin/clients')}>
                  View in Clients
                </Button>
              </div>
            ) : step ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-card p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Next: {step.action}</p>
                  <p className="text-xs text-muted-foreground">{step.help}</p>
                </div>
                <Button className="shrink-0 gap-1.5" onClick={advanceFlow}>{step.action}</Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">This lead is closed — no further steps.</p>
            )}
            <a href="/intake" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Preview the client intake form ↗
            </a>
          </CardContent>
        </Card>

        {/* Every field on the record, plainly labelled. Email & source were
            dropped from the leads table to kill horizontal scroll, so this is
            now the only place they're readable. */}
        <Card>
          <CardHeader><CardTitle className="text-base">Lead details</CardTitle></CardHeader>
          <CardContent className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <Field label="Lead ID" value={lead.id} mono />
            <Field label="Created" value={lead.createdAt ? formatDate(lead.createdAt) : '—'} />
            <Field label="Full name" value={lead.name} />
            <Field label="Brand" value={lead.brand} />
            <Field label="Event type" value={lead.eventType} />
            <Field label="Source" value={lead.source} />
            <Field label="Stage" value={lead.stage} />
            <Field label="Assigned to" value={lead.assignedTo} />
            <Field label="Estimated value" value={formatCurrency(lead.value)} />
            <Field
              label="Next follow-up"
              value={lead.nextFollowUp ? formatDate(lead.nextFollowUp) : null}
              tone={['overdue', 'today'].includes(status) ? 'urgent' : undefined}
            />
            {/* Click-to-contact — the admin team shouldn't have to copy these out. */}
            <Field
              label="Email"
              value={lead.email}
              icon={Mail}
              href={lead.email ? `mailto:${lead.email}` : null}
            />
            <Field
              label="Phone"
              value={lead.phone}
              icon={Phone}
              href={lead.phone ? `tel:${lead.phone.replace(/[^\d+]/g, '')}` : null}
            />
            <div className="sm:col-span-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Notes</p>
              <p className="mt-1.5 rounded-lg bg-muted/50 p-3 text-sm">
                {lead.notes || <span className="text-muted-foreground">No notes on this lead.</span>}
              </p>
            </div>
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
                <Button onClick={logCommunication}>Add entry</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this lead?"
        description={`"${lead.name}" will be removed from the pipeline.`}
        onConfirm={removeNow}
      />
    </div>
  )
}
