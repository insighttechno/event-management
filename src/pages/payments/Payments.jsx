import { useMemo, useState } from 'react'
import { BellRing, DollarSign, Plus, Receipt, Send } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { EntityFormDialog } from '@/components/common/EntityFormDialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { RowActions } from '@/components/common/RowActions'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { invoices as initialInvoices, monthlyRevenue } from '@/data/finance'
import { formatCurrency, formatDate, nextSequentialId } from '@/lib/utils'

const statusVariant = {
  Paid: 'secondary',
  'Partially Paid': 'outline',
  'Awaiting Payment': 'destructive',
}

const invoiceStatuses = ['Awaiting Payment', 'Partially Paid', 'Paid']

const invoiceFields = [
  { name: 'client', label: 'Client', span: 'full', required: true },
  { name: 'event', label: 'Event', span: 'full' },
  { name: 'amount', label: 'Total amount', type: 'number', min: 0 },
  { name: 'paid', label: 'Amount paid', type: 'number', min: 0 },
  { name: 'dueDate', label: 'Due date', type: 'date', required: true },
  { name: 'status', label: 'Status', type: 'select', options: invoiceStatuses },
]

const emptyInvoice = {
  client: '',
  event: '',
  amount: '',
  paid: '',
  dueDate: '',
  status: 'Awaiting Payment',
}

export default function Payments() {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [formOpen, setFormOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [paymentTarget, setPaymentTarget] = useState(null)

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.paid, 0)
  const totalOutstanding = totalInvoiced - totalCollected
  const thisMonth = monthlyRevenue[monthlyRevenue.length - 1]

  const today = new Date().toISOString().slice(0, 10)
  const dueInvoices = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status !== 'Paid' && inv.dueDate && inv.dueDate <= today)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [invoices, today]
  )

  const recordPayment = (values) => {
    const amount = Number(values.amount) || 0
    if (amount <= 0) return
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== paymentTarget.id) return inv
        const paid = Math.min(inv.paid + amount, inv.amount)
        return {
          ...inv,
          paid,
          status: paid >= inv.amount ? 'Paid' : 'Partially Paid',
        }
      })
    )
    toast.success(`${formatCurrency(amount)} payment recorded for ${paymentTarget.id}.`)
  }

  const sendPaymentReminder = (invoice) => {
    toast.success(`Payment reminder sent to ${invoice.client} for ${invoice.id}.`)
  }

  const openAddDialog = () => {
    setEditingInvoice(null)
    setFormOpen(true)
  }

  const openEditDialog = (invoice) => {
    setEditingInvoice(invoice)
    setFormOpen(true)
  }

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      amount: Number(values.amount) || 0,
      paid: Number(values.paid) || 0,
    }

    if (editingInvoice) {
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.id === editingInvoice.id ? { ...invoice, ...payload } : invoice
        )
      )
      toast.success(`Invoice for ${payload.client} updated.`)
    } else {
      const newInvoice = {
        ...payload,
        id: nextSequentialId(invoices, 'INV'),
      }
      setInvoices((prev) => [newInvoice, ...prev])
      toast.success(`Invoice for ${payload.client} added.`)
    }
  }

  const handleDelete = () => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== deleteTarget.id))
    toast.success(`Invoice ${deleteTarget.id} deleted.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments & Invoice Tracking"
        description="Revenue overview, invoice status and outstanding balances."
        action={
          <Button onClick={openAddDialog} className="gap-1.5">
            <Plus className="size-4" />
            Add Invoice
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Invoiced" value={formatCurrency(totalInvoiced)} icon={Receipt} accent="primary" />
        <StatCard label="Collected" value={formatCurrency(totalCollected)} icon={DollarSign} accent="secondary" />
        <StatCard
          label="Outstanding"
          value={formatCurrency(totalOutstanding)}
          icon={Receipt}
          hint={`${thisMonth.month} revenue: ${formatCurrency(thisMonth.revenue)}`}
          accent="accent"
        />
      </div>

      {dueInvoices.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="size-4 text-amber-600" />
              Payment reminders
            </CardTitle>
            <CardDescription>
              {dueInvoices.length} invoice{dueInvoices.length > 1 ? 's' : ''} due or overdue
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {dueInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {invoice.id} · {invoice.client}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(invoice.amount - invoice.paid)} outstanding · due{' '}
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => sendPaymentReminder(invoice)}
                >
                  <Send className="size-3.5" />
                  Send reminder
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Revenue Reporting</CardTitle>
          <CardDescription>Monthly collected revenue across both businesses</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(v) => `$${v / 1000}k`}
                width={42}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={{
                  borderRadius: 8,
                  borderColor: 'var(--border)',
                  fontSize: 13,
                }}
              />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>{invoices.length} invoices across both businesses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.event}</TableCell>
                  <TableCell>
                    {invoice.dueDate ? formatDate(invoice.dueDate) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[invoice.status] ?? 'outline'}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(invoice.paid)}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {invoice.status !== 'Paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPaymentTarget(invoice)}
                        >
                          Record payment
                        </Button>
                      )}
                      <RowActions
                        onEdit={() => openEditDialog(invoice)}
                        onDelete={() => setDeleteTarget(invoice)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EntityFormDialog
        open={!!paymentTarget}
        onOpenChange={(open) => !open && setPaymentTarget(null)}
        title="Record Payment"
        description={
          paymentTarget
            ? `${paymentTarget.id} · ${paymentTarget.client} · ${formatCurrency(
                paymentTarget.amount - paymentTarget.paid
              )} outstanding`
            : ''
        }
        fields={[
          {
            name: 'amount',
            label: 'Payment amount',
            type: 'number',
            min: 1,
            required: true,
            span: 'full',
          },
        ]}
        defaultValues={{ amount: '' }}
        onSubmit={recordPayment}
        submitLabel="Record payment"
      />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingInvoice ? 'Edit Invoice' : 'Add Invoice'}
        description={
          editingInvoice
            ? 'Update this invoice and save your changes.'
            : 'Create a new invoice.'
        }
        fields={invoiceFields}
        defaultValues={editingInvoice ?? emptyInvoice}
        onSubmit={handleSubmit}
        submitLabel={editingInvoice ? 'Save changes' : 'Add invoice'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this invoice?"
        description={
          deleteTarget
            ? `Invoice ${deleteTarget.id} for ${deleteTarget.client} will be permanently removed. This cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
      />
    </div>
  )
}
