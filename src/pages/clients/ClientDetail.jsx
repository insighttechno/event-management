import { useState, useSyncExternalStore } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CalendarPlus, FolderOpen, Mail, Phone, Receipt, CalendarDays, Ticket, Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { BackHeader } from '@/components/common/BackHeader'
import { BrandBadge } from '@/components/common/BrandBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { StatStrip } from '@/components/common/StatStrip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getClients, setClients, subscribeClients } from '@/lib/clients-store'
import { contracts as allContracts, invoices as allInvoices } from '@/data/finance'
import { meetings as allMeetings } from '@/data/meetings'
import { events as allEvents } from '@/data/events'
import { documents as allDocuments } from '@/data/documents'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusTone = (s) =>
  s === 'Active' ? 'bg-primary/15 text-primary'
    : s === 'Completed' ? 'bg-emerald-500/15 text-emerald-700'
    : 'bg-muted text-muted-foreground'

const payTone = (s) =>
  s === 'Paid' ? 'bg-emerald-500/15 text-emerald-700'
    : s === 'Partially Paid' ? 'bg-amber-500/15 text-amber-700'
    : 'bg-muted text-muted-foreground'

const signTone = (s) =>
  s === 'Signed' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-amber-500/15 text-amber-700'

// Small labelled shell so every tab's empty state reads the same.
function TabCard({ title, description, count, children, empty }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {count === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          <div className="overflow-x-auto">{children}</div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const clients = useSyncExternalStore(subscribeClients, getClients)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const client = clients.find((c) => c.id === id)
  const name = client?.name

  // Everything in the portal links to a client by name, so one lookup feeds
  // every tab below.
  const scoped = {
    invoices: allInvoices.filter((r) => r.client === name),
    contracts: allContracts.filter((r) => r.client === name),
    meetings: allMeetings.filter((r) => r.client === name),
    events: allEvents.filter((r) => r.client === name),
    documents: allDocuments.filter((r) => r.client === name),
  }

  if (!client) {
    return (
      <div className="max-w-5xl">
        <BackHeader
          title="Client not found"
          description="This client may have been removed."
          backLabel="Back to clients"
          onBack={() => navigate('/admin/clients')}
        />
      </div>
    )
  }

  const billed = scoped.invoices.reduce((sum, i) => sum + i.amount, 0)
  const paid = scoped.invoices.reduce((sum, i) => sum + i.paid, 0)
  const creditsPct = client.creditsTotal ? (client.creditsUsed / client.creditsTotal) * 100 : 0

  const removeNow = () => {
    setClients(clients.filter((c) => c.id !== client.id))
    toast.success(`Client "${client.name}" removed.`)
    navigate('/admin/clients')
  }

  const scheduleMeeting = () => navigate('/admin/calendar', {
    state: { scheduleFor: { client: client.name, email: client.email, brand: client.brand } },
  })

  return (
    <div className="max-w-6xl">
      <BackHeader
        title={client.name}
        backLabel="Back to clients"
        onBack={() => navigate('/admin/clients')}
        description={`${client.event || 'Client'} · ${client.package || 'No package assigned'}`}
      />

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <BrandBadge brand={client.brand} />
          <Badge className={statusTone(client.status)} variant="secondary">{client.status}</Badge>
          <Badge variant={client.onboarding === 'Acknowledged' ? 'secondary' : 'outline'}>
            Onboarding: {client.onboarding}
          </Badge>
          <div className="ml-auto flex flex-wrap gap-2">
            {client.status === 'Active' && (
              <Button variant="outline" className="gap-1.5" onClick={scheduleMeeting}>
                <CalendarPlus className="size-4" />Schedule
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate('/admin/clients', { state: { editId: client.id } })}
            >
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Remove</Button>
          </div>
        </div>

        <StatStrip
          items={[
            { label: 'Event date', value: client.eventDate ? formatDate(client.eventDate) : '—', icon: CalendarDays, accent: 'primary' },
            { label: 'Consultation credits', value: `${client.creditsUsed}/${client.creditsTotal}`, icon: Ticket, accent: 'navy' },
            { label: 'Billed', value: billed ? formatCurrency(billed) : '—', icon: Receipt, accent: 'accent' },
            { label: 'Outstanding', value: client.balance ? formatCurrency(client.balance) : formatCurrency(0), icon: Wallet, accent: 'primary' },
          ]}
        />

        <Tabs defaultValue="overview">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({scoped.invoices.length})</TabsTrigger>
            <TabsTrigger value="contracts">Contracts ({scoped.contracts.length})</TabsTrigger>
            <TabsTrigger value="meetings">Meetings ({scoped.meetings.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({scoped.events.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({scoped.documents.length})</TabsTrigger>
          </TabsList>

          {/* ---------------- OVERVIEW ---------------- */}
          <TabsContent value="overview" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <p className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" />{client.email || '—'}</p>
                  <p className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" />{client.phone || '—'}</p>
                  <p className="text-muted-foreground">Event <span className="font-medium text-foreground">{client.event || '—'}</span></p>
                  <p className="text-muted-foreground">Package <span className="font-medium text-foreground">{client.package || '—'}</span></p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Consultation credits</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-2xl font-semibold">
                      {client.creditsUsed}<span className="text-base text-muted-foreground">/{client.creditsTotal}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.max(0, client.creditsTotal - client.creditsUsed)} remaining
                    </span>
                  </div>
                  <Progress value={creditsPct} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Credits are consumed by scheduled package calls.
                  </p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-base">Payments</CardTitle></CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Billed</p>
                    <p className="font-display text-xl font-semibold">{formatCurrency(billed)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="font-display text-xl font-semibold text-emerald-600">{formatCurrency(paid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className={cn('font-display text-xl font-semibold', client.balance && 'text-amber-600')}>
                      {formatCurrency(client.balance || 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ---------------- INVOICES ---------------- */}
          <TabsContent value="invoices" className="mt-4">
            <TabCard
              title="Invoices"
              description="Everything billed to this client"
              count={scoped.invoices.length}
              empty="No invoices raised for this client yet."
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoped.invoices.map((inv) => (
                    <TableRow
                      key={inv.id}
                      className="cursor-pointer"
                      onClick={() => navigate('/admin/payments')}
                    >
                      <TableCell className="font-medium">{inv.id}</TableCell>
                      <TableCell className="text-sm">{inv.event}</TableCell>
                      <TableCell className="text-sm">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell><Badge className={payTone(inv.status)} variant="secondary">{inv.status}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(inv.amount)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(inv.paid)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabCard>
          </TabsContent>

          {/* ---------------- CONTRACTS ---------------- */}
          <TabsContent value="contracts" className="mt-4">
            <TabCard
              title="Contracts"
              description="Agreements sent for e-signature"
              count={scoped.contracts.length}
              empty="No contracts for this client yet."
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Signed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoped.contracts.map((c) => (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer"
                      onClick={() => navigate('/admin/contracts')}
                    >
                      <TableCell>
                        <p className="font-medium">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.id}</p>
                      </TableCell>
                      <TableCell className="text-sm">{c.event}</TableCell>
                      <TableCell className="text-sm">{c.sentDate ? formatDate(c.sentDate) : '—'}</TableCell>
                      <TableCell className="text-sm">{c.signedDate ? formatDate(c.signedDate) : '—'}</TableCell>
                      <TableCell><Badge className={signTone(c.status)} variant="secondary">{c.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabCard>
          </TabsContent>

          {/* ---------------- MEETINGS ---------------- */}
          <TabsContent value="meetings" className="mt-4">
            <TabCard
              title="Booked meetings"
              description="Consultation calls scheduled with this client"
              count={scoped.meetings.length}
              empty="No meetings booked for this client yet."
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meeting</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoped.meetings.map((m) => (
                    <TableRow
                      key={m.id}
                      className="cursor-pointer"
                      onClick={() => navigate('/admin/calendar')}
                    >
                      <TableCell className="font-medium">{m.id}</TableCell>
                      <TableCell className="text-sm">{m.type}</TableCell>
                      <TableCell className="text-sm">{formatDate(m.date)}</TableCell>
                      <TableCell className="text-sm">{m.time}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.creditType}</TableCell>
                      <TableCell><Badge variant="outline">{m.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabCard>
          </TabsContent>

          {/* ---------------- EVENTS ---------------- */}
          <TabsContent value="events" className="mt-4">
            <TabCard
              title="Events"
              description="Events being planned for this client"
              count={scoped.events.length}
              empty="No events for this client yet."
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoped.events.map((e) => (
                    <TableRow
                      key={e.id}
                      className="cursor-pointer"
                      onClick={() => navigate('/admin/events')}
                    >
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell className="text-sm">{e.type}</TableCell>
                      <TableCell className="text-sm">{formatDate(e.date)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{e.venue}</TableCell>
                      <TableCell><Badge variant="outline">{e.status}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(e.budget)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabCard>
          </TabsContent>

          {/* ---------------- DOCUMENTS ---------------- */}
          <TabsContent value="documents" className="mt-4">
            <TabCard
              title="Documents"
              description="Files stored against this client"
              count={scoped.documents.length}
              empty="No documents for this client yet."
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Folder</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Shared</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoped.documents.map((d) => (
                    <TableRow
                      key={d.id}
                      className="cursor-pointer"
                      onClick={() => navigate('/admin/documents')}
                    >
                      <TableCell className="flex items-center gap-2 font-medium">
                        <FolderOpen className="size-4 shrink-0 text-muted-foreground" />{d.name}
                      </TableCell>
                      <TableCell className="text-sm">{d.folder}</TableCell>
                      <TableCell className="text-sm">{formatDate(d.uploadedAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{d.size}</TableCell>
                      <TableCell>
                        <Badge variant={d.sharedWithClient ? 'secondary' : 'outline'}>
                          {d.sharedWithClient ? 'Shared' : 'Internal'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabCard>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove this client?"
        description={`"${client.name}" will be removed from the client list.`}
        confirmLabel="Remove"
        onConfirm={removeNow}
      />
    </div>
  )
}
