import { useMemo, useState, useSyncExternalStore } from 'react'
import {
  Plus, Receipt, DollarSign, Send, BellRing, Check, Eye,
  FileText, ShieldCheck, CreditCard, Wallet, CheckCircle2,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { BrandBadge } from '@/components/common/BrandBadge'
import { StatCard } from '@/components/common/StatCard'
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
import { invoices as initialInvoices, monthlyRevenue, paymentMethods } from '@/data/finance'
import { ALL_BRANDS, getActiveBrand, matchesBrand, subscribeActiveBrand } from '@/lib/brand-scope'
import { packageBrands } from '@/data/packages'
import { formatCurrency, formatDate, nextSequentialId } from '@/lib/utils'

const statuses = ['Awaiting Payment', 'Partially Paid', 'Paid']
const statusTone = (s) =>
  s === 'Paid' ? 'bg-emerald-500/15 text-emerald-700'
    : s === 'Partially Paid' ? 'bg-primary/15 text-primary'
    : 'bg-amber-500/15 text-amber-700'

const today = new Date().toISOString().slice(0, 10)
const isOverdue = (inv) => inv.status !== 'Paid' && inv.dueDate && inv.dueDate <= today
const depositPaid = (inv) => inv.paid >= (inv.deposit || 0) && inv.paid > 0

const emptyForm = {
  client: '', brand: 'Family Affair', event: '', amount: '', deposit: 1000, paid: 0,
  dueDate: '', status: 'Awaiting Payment',
}

export default function Payments() {
  const [invoices, setInvoices] = useState(initialInvoices)
  const activeBrand = useSyncExternalStore(subscribeActiveBrand, getActiveBrand)
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [detailId, setDetailId] = useState(null)
  const [confirmSave, setConfirmSave] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [confirmPay, setConfirmPay] = useState(false)

  const detail = invoices.find((i) => i.id === detailId) ?? null
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  // `invoices` stays the full list so writes and ID generation are unaffected;
  // only what's shown is scoped to the sidebar's brand.
  const brandInvoices = useMemo(
    () => invoices.filter((i) => matchesBrand(i.brand, activeBrand)),
    [invoices, activeBrand]
  )

  const totalInvoiced = brandInvoices.reduce((s, i) => s + i.amount, 0)
  const totalCollected = brandInvoices.reduce((s, i) => s + i.paid, 0)
  const dueInvoices = useMemo(() => brandInvoices.filter(isOverdue).sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [brandInvoices])

  const startAdd = () => { setEditing(null); setForm(emptyForm); setView('form') }
  const startEdit = (inv) => { setEditing(inv); setForm({ ...inv }); setView('form') }
  const openDetail = (inv) => { setDetailId(inv.id); setView('detail') }

  const columns = useMemo(() => [
    { key: 'id', header: 'Invoice', sortable: true, className: 'font-medium' },
    { key: 'client', header: 'Client', sortable: true },
    { key: 'brand', header: 'Brand', sortable: true, cell: (inv) => <BrandBadge brand={inv.brand} /> },
    {
      key: 'dueDate',
      header: 'Due date',
      sortable: true,
      cell: (inv) => (
        <span className={`text-sm ${isOverdue(inv) ? 'font-medium text-destructive' : ''}`}>
          {inv.dueDate ? formatDate(inv.dueDate) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (inv) => <Badge className={statusTone(inv.status)} variant="secondary">{inv.status}</Badge>,
    },
    {
      key: 'paid',
      header: 'Paid',
      sortable: true,
      headClassName: 'text-right',
      className: 'text-right text-muted-foreground',
      cell: (inv) => formatCurrency(inv.paid),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      headClassName: 'text-right',
      className: 'text-right font-medium',
      cell: (inv) => formatCurrency(inv.amount),
    },
    {
      key: 'actions',
      header: 'Actions',
      stopClick: true,
      headClassName: 'w-28 text-right',
      cell: (inv) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openDetail(inv)}>
            <Eye className="size-3.5" />View
          </Button>
          <RowActions onEdit={() => startEdit(inv)} onDelete={() => setDeleteTarget(inv)} />
        </div>
      ),
    },
  ], [])

  const saveNow = () => {
    const payload = { ...form, amount: Number(form.amount) || 0, deposit: Number(form.deposit) || 0, paid: Number(form.paid) || 0 }
    if (editing) {
      setInvoices((prev) => prev.map((i) => (i.id === editing.id ? { ...i, ...payload } : i)))
      toast.success(`Invoice for ${payload.client} updated.`)
    } else {
      setInvoices((prev) => [{ ...payload, id: nextSequentialId(invoices, 'INV') }, ...prev])
      toast.success(`Invoice for ${payload.client} created.`)
    }
    setView('list')
  }

  const removeNow = () => {
    setInvoices((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    toast.success(`Invoice ${deleteTarget.id} deleted.`)
  }

  const recordPayment = () => {
    const amt = Number(payAmount) || 0
    if (amt <= 0) return
    setInvoices((prev) => prev.map((i) => {
      if (i.id !== detail.id) return i
      const paid = Math.min(i.paid + amt, i.amount)
      return { ...i, paid, status: paid >= i.amount ? 'Paid' : 'Partially Paid' }
    }))
    toast.success(`${formatCurrency(amt)} recorded for ${detail.id}.`)
    setPayAmount('')
  }

  // ================= IN-PAGE FORM =================
  if (view === 'form') {
    return (
      <div className="max-w-5xl">
        <BackHeader title={editing ? 'Edit invoice' : 'New invoice'} backLabel="Back to invoices"
          onBack={() => setView('list')} description="Create the invoice, deposit and balance. QuickBooks keeps the accounting in sync." />
        <Card>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
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
              <Label>Event</Label>
              <Input value={form.event} onChange={(e) => setField('event', e.target.value)} placeholder="Whitfield Wedding" />
            </div>
            <div className="space-y-1.5">
              <Label>Total amount (USD)</Label>
              <Input type="number" min={0} value={form.amount} onChange={(e) => setField('amount', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Deposit required (USD)</Label>
              <Input type="number" min={0} value={form.deposit} onChange={(e) => setField('deposit', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Balance due date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.client.trim()} onClick={() => setConfirmSave(true)}>
                <Check className="size-4" />{editing ? 'Save changes' : 'Create invoice'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <ConfirmDialog open={confirmSave} onOpenChange={setConfirmSave}
          title={editing ? 'Save changes?' : 'Create this invoice?'}
          description={`Invoice for ${form.client || 'the client'} will be ${editing ? 'updated' : 'created'} and synced to QuickBooks.`}
          confirmLabel={editing ? 'Save' : 'Create'} confirmVariant="default" onConfirm={saveNow} />
      </div>
    )
  }

  // ================= DETAIL / BUNDLE =================
  if (view === 'detail' && detail) {
    const balance = detail.amount - detail.paid
    return (
      <div className="max-w-4xl">
        <BackHeader title={`Invoice ${detail.id}`} backLabel="Back to invoices" onBack={() => setView('list')}
          description={`${detail.client} · ${detail.event || '—'}`} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <BrandBadge brand={detail.brand} />
            <Badge className={statusTone(detail.status)} variant="secondary">{detail.status}</Badge>
            {depositPaid(detail) && <Badge className="bg-emerald-500/15 text-emerald-700" variant="secondary"><Check className="size-3" />Deposit paid</Badge>}
            <div className="ml-auto flex gap-2">
              <Button variant="outline" className="gap-1.5" onClick={() => toast.success(`Bundle re-sent to ${detail.client}.`)}><Send className="size-3.5" />Send bundle</Button>
              <Button variant="outline" onClick={() => startEdit(detail)}>Edit</Button>
            </div>
          </div>

          {/* Amounts */}
          <Card>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-display text-2xl font-semibold">{formatCurrency(detail.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Deposit</p>
                <p className="font-display text-2xl font-semibold">{formatCurrency(detail.deposit || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Balance remaining</p>
                <p className="font-display text-2xl font-semibold">{formatCurrency(balance)}</p>
                <p className="text-xs text-muted-foreground">Due {detail.dueDate ? formatDate(detail.dueDate) : '—'}{isOverdue(detail) && <span className="font-medium text-destructive"> · overdue</span>}</p>
              </div>
              <div className="sm:col-span-3">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(detail.paid)} collected</span><span>{formatCurrency(detail.amount)}</span>
                </div>
                <Progress value={detail.amount ? (detail.paid / detail.amount) * 100 : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* The bundle */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Invoice bundle</CardTitle>
              <CardDescription>Everything the client receives in one email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { icon: FileText, label: 'Signed contract (copy)', action: () => toast.success('Opening signed contract.'), cta: 'View' },
                { icon: ShieldCheck, label: 'Wedding insurance flyer', href: '/wedding-insurance', cta: 'Open ↗' },
                { icon: Receipt, label: 'PDF invoice', action: () => toast.success('Downloading PDF invoice.'), cta: 'Download' },
                { icon: CreditCard, label: 'Payment link', action: () => toast.success('Payment link copied.'), cta: 'Copy link' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="size-4" /></div>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</p>
                  {item.href
                    ? <Button asChild size="sm" variant="outline"><a href={item.href} target="_blank" rel="noreferrer">{item.cta}</a></Button>
                    : <Button size="sm" variant="outline" onClick={item.action}>{item.cta}</Button>}
                </div>
              ))}
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Wallet className="size-3.5" />Accepted payment methods</p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {paymentMethods.map((m) => (
                    <p key={m.method} className="text-sm"><span className="font-medium">{m.method}</span> <span className="text-muted-foreground">· {m.detail}</span></p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Record payment */}
          {detail.status !== 'Paid' && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Record a payment</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <Label>Amount received (USD)</Label>
                  <Input type="number" min={1} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-48" placeholder="1000" />
                </div>
                <Button className="gap-1.5" disabled={!(Number(payAmount) > 0)} onClick={() => setConfirmPay(true)}><CheckCircle2 className="size-4" />Record payment</Button>
                <Button variant="outline" className="gap-1.5" onClick={() => toast.success(`Payment reminder sent to ${detail.client}.`)}><BellRing className="size-3.5" />Send reminder</Button>
              </CardContent>
            </Card>
          )}
        </div>

        <ConfirmDialog open={confirmPay} onOpenChange={setConfirmPay} title="Record this payment?"
          description={`${formatCurrency(Number(payAmount) || 0)} will be recorded against ${detail.id} and synced to QuickBooks.`}
          confirmLabel="Record" confirmVariant="default" onConfirm={recordPayment} />
      </div>
    )
  }

  // ================= LIST =================
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payments & Invoice Tracking"
        description="Invoices, deposits and balances — tracked via QuickBooks Online."
        action={<Button className="gap-1.5" onClick={startAdd}><Plus className="size-4" />New invoice</Button>} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total invoiced" value={formatCurrency(totalInvoiced)} icon={Receipt} hint={activeBrand === ALL_BRANDS ? 'Across both brands' : activeBrand} accent="primary" />
        <StatCard label="Collected" value={formatCurrency(totalCollected)} icon={DollarSign} hint={`${formatCurrency(totalInvoiced - totalCollected)} outstanding`} accent="secondary" trend="+18%" trendUp />
        <StatCard label="Overdue" value={dueInvoices.length} icon={BellRing} hint="Need a reminder" accent="accent" />
      </div>

      {dueInvoices.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><BellRing className="size-4 text-amber-600" />Payment reminders</CardTitle>
            <CardDescription>{dueInvoices.length} invoice{dueInvoices.length > 1 ? 's' : ''} due or overdue</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {dueInvoices.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{inv.id} · {inv.client}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(inv.amount - inv.paid)} outstanding · due {formatDate(inv.dueDate)}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.success(`Payment reminder sent to ${inv.client}.`)}><Send className="size-3.5" />Send reminder</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <DataTable
        title="Invoices"
        description={`${brandInvoices.length} invoice${brandInvoices.length === 1 ? '' : 's'}${activeBrand === ALL_BRANDS ? ' across both brands' : ` · ${activeBrand}`}`}
        columns={columns}
        rows={brandInvoices}
        onRowClick={openDetail}
        searchKeys={['id', 'client', 'event']}
        searchPlaceholder="Search by invoice, client, event…"
        filters={[
          { key: 'brand', label: 'Brand', options: packageBrands },
          { key: 'status', label: 'Status', options: ['Paid', 'Partially Paid', 'Awaiting Payment'] },
        ]}
        emptyMessage="No invoices raised yet."
      />

      <Card>
        <CardHeader>
          <CardTitle>Revenue Reporting</CardTitle>
          <CardDescription>Monthly collected revenue across both brands</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} width={42} />
              <Tooltip formatter={(v) => formatCurrency(v)} cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: 8, borderColor: 'var(--border)', fontSize: 13 }} />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this invoice?" description={deleteTarget ? `Invoice ${deleteTarget.id} for ${deleteTarget.client} will be removed.` : ''}
        confirmLabel="Delete" onConfirm={removeNow} />
    </div>
  )
}
