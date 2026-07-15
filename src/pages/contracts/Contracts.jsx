import { useState } from 'react'
import { Plus, Send, Sparkles, Eye, PenLine, CheckCircle2, Clock, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { BrandBadge } from '@/components/common/BrandBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { contracts as initialContracts } from '@/data/finance'
import { clients } from '@/data/clients'
import { formatDate } from '@/lib/utils'

const TEMPLATES = [
  'Wedding Planning Agreement',
  'Full Service Wedding Contract',
  'Vow Renewal Agreement',
  'Photography Agreement',
]

const statusTone = (s) =>
  s === 'Signed' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-amber-500/15 text-amber-700'

// Simulated AI draft — in the real system this is generated from the client's
// intake form data using the selected template.
function generateBody(client, template) {
  return `THIS ${template.toUpperCase()} is entered into between ${client.brand} ("Planner") and ${client.name} ("Client").

EVENT DETAILS
• Event:   ${client.event || '—'}
• Date:    ${client.eventDate ? formatDate(client.eventDate) : 'TBD'}
• Package: ${client.package || '—'}

1. SERVICES
The Planner will provide the services included in the ${client.package || 'selected'} package for the Client's event described above.

2. FEES & PAYMENT
A non-refundable deposit of $1,000 is due upon signing. The remaining balance is due no later than 60 days before the event date. Accepted methods: electronic check, Zelle, Venmo or mailed check.

3. WEDDING INSURANCE
The Client is strongly encouraged to obtain wedding insurance to protect against unforeseen cancellation or postponement.

4. CANCELLATION
Cancellations must be submitted in writing. The deposit is non-refundable.

5. AGREEMENT
By signing below, both parties agree to the terms set out in this agreement.

_____________________________        _____________________________
${client.name} (Client)               ${client.brand} (Planner)`
}

const emptyForm = { clientId: '', template: TEMPLATES[0], body: '' }

export default function Contracts() {
  const [contracts, setContracts] = useState(
    initialContracts.map((c) => ({ ...c, brand: 'Family Affair' }))
  )
  const [view, setView] = useState('list')
  const [form, setForm] = useState(emptyForm)
  const [detailId, setDetailId] = useState(null)
  const [confirmSend, setConfirmSend] = useState(false)
  const [signTarget, setSignTarget] = useState(null)

  const detail = contracts.find((c) => c.id === detailId) ?? null
  const selectedClient = clients.find((c) => c.id === form.clientId) ?? null

  const generateDraft = () => {
    if (!selectedClient) return
    setForm((prev) => ({ ...prev, body: generateBody(selectedClient, prev.template) }))
    toast.success('AI draft generated from the client’s intake form.')
  }

  const sendNow = () => {
    const id = `C-${9000 + contracts.length + 10}`
    const newContract = {
      id, title: form.template, client: selectedClient.name, brand: selectedClient.brand,
      event: selectedClient.event, status: 'Awaiting Signature',
      sentDate: new Date().toISOString().slice(0, 10), signedDate: null, body: form.body,
    }
    setContracts((prev) => [newContract, ...prev])
    toast.success(`Contract sent to ${selectedClient.name} via Adobe Acrobat Sign.`)
    setForm(emptyForm)
    setView('list')
  }

  // Simulate the client signing (webhook back from Adobe)
  const signNow = () => {
    setContracts((prev) => prev.map((c) => (c.id === signTarget.id
      ? { ...c, status: 'Signed', signedDate: new Date().toISOString().slice(0, 10) } : c)))
    toast.success(`${signTarget.client} signed — copy stored in both portals.`)
  }

  const awaiting = contracts.filter((c) => c.status !== 'Signed').length

  // ============ NEW CONTRACT (in-page) ============
  if (view === 'new') {
    return (
      <div className="max-w-4xl">
        <BackHeader title="New contract" backLabel="Back to contracts" onBack={() => { setForm(emptyForm); setView('list') }}
          description="Generate a contract from the client's details, review it, then send for e-signature." />
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Client</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm((p) => ({ ...p, clientId: v, body: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {c.brand}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Contract template</Label>
                <Select value={form.template} onValueChange={(v) => setForm((p) => ({ ...p, template: v, body: '' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TEMPLATES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <Button variant="outline" className="gap-2" disabled={!selectedClient} onClick={generateDraft}>
              <Sparkles className="size-4" />Generate draft with AI
            </Button>

            {form.body && (
              <div className="space-y-1.5">
                <Label>Contract draft (review &amp; edit)</Label>
                <Textarea rows={16} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} className="font-mono text-xs leading-relaxed" />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setForm(emptyForm); setView('list') }}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.body} onClick={() => setConfirmSend(true)}>
                <Send className="size-4" />Send for signature
              </Button>
            </div>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={confirmSend}
          onOpenChange={setConfirmSend}
          title="Send for signature?"
          description={`The contract will be sent to ${selectedClient?.name || 'the client'} via Adobe Acrobat Sign for e-signature.`}
          confirmLabel="Send"
          confirmVariant="default"
          onConfirm={sendNow}
        />
      </div>
    )
  }

  // ============ CONTRACT DETAIL (status + lifecycle) ============
  if (view === 'detail' && detail) {
    const steps = [
      { label: 'Drafted', done: true, date: detail.sentDate, icon: FileText, note: 'AI-generated from intake form' },
      { label: 'Sent for signature', done: true, date: detail.sentDate, icon: Send, note: 'Delivered via Adobe Acrobat Sign' },
      { label: 'Signed by client', done: detail.status === 'Signed', date: detail.signedDate, icon: CheckCircle2, note: detail.status === 'Signed' ? 'Copy stored in both portals' : 'Waiting on the client…' },
    ]
    return (
      <div className="max-w-4xl">
        <BackHeader title={detail.title} backLabel="Back to contracts" onBack={() => setView('list')}
          description={`${detail.client} · ${detail.event || '—'}`} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <BrandBadge brand={detail.brand} />
            <Badge className={statusTone(detail.status)} variant="secondary">{detail.status}</Badge>
            <div className="ml-auto flex gap-2">
              {detail.status !== 'Signed' && (
                <>
                  <Button variant="outline" className="gap-1.5" onClick={() => toast.success(`Reminder sent to ${detail.client}.`)}>
                    <Send className="size-3.5" />Send reminder
                  </Button>
                  <Button className="gap-1.5" onClick={() => setSignTarget(detail)}>
                    <PenLine className="size-4" />Simulate client signature
                  </Button>
                </>
              )}
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Signature status</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative flex flex-col gap-5 border-l border-border pl-5">
                {steps.map((s) => (
                  <li key={s.label} className="relative">
                    <span className={`absolute -left-[27px] flex size-6 items-center justify-center rounded-full ring-4 ring-card ${s.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {s.done ? <s.icon className="size-3.5" /> : <Clock className="size-3.5" />}
                    </span>
                    <p className="text-sm font-medium">{s.label}{s.date && s.done ? ` · ${formatDate(s.date)}` : ''}</p>
                    <p className="text-xs text-muted-foreground">{s.note}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Contract document</CardTitle></CardHeader>
            <CardContent>
              {detail.body ? (
                <pre className="max-h-96 overflow-auto rounded-lg bg-muted/40 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">{detail.body}</pre>
              ) : (
                <p className="text-sm text-muted-foreground">Signed contract document is on file.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <ConfirmDialog
          open={!!signTarget}
          onOpenChange={(open) => !open && setSignTarget(null)}
          title="Simulate client signature?"
          description="This mimics the client signing in Adobe Acrobat Sign — the status becomes Signed and the copy is stored."
          confirmLabel="Mark signed"
          confirmVariant="default"
          onConfirm={signNow}
        />
      </div>
    )
  }

  // ============ LIST ============
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Contracts"
        description="AI-drafted from the intake form, sent for e-signature via Adobe Acrobat Sign."
        action={<Button className="gap-1.5" onClick={() => { setForm(emptyForm); setView('new') }}><Plus className="size-4" />New contract</Button>}
      />

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">How it works:</span> pick a client &amp; template → AI drafts the
            contract → review &amp; edit → send for e-signature. When the client signs, the status flips to
            <span className="font-medium text-foreground"> Signed</span> and the copy is stored in both portals.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All contracts</CardTitle>
          <CardDescription>{contracts.length} on record · {awaiting} awaiting signature</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Signed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{c.client}</TableCell>
                  <TableCell><BrandBadge brand={c.brand} /></TableCell>
                  <TableCell className="text-sm">{formatDate(c.sentDate)}</TableCell>
                  <TableCell className="text-sm">{c.signedDate ? formatDate(c.signedDate) : '—'}</TableCell>
                  <TableCell><Badge className={statusTone(c.status)} variant="secondary">{c.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setDetailId(c.id); setView('detail') }}>
                      <Eye className="size-3.5" />View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
