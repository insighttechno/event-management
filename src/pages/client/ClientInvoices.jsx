import { useState } from 'react'
import { CreditCard, Download, History, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { eventsService } from '@/services/events'
import { invoicesService } from '@/services/finance'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusVariant = {
  Paid: 'secondary',
  'Partially Paid': 'outline',
  'Awaiting Payment': 'destructive',
}

const initialHistory = [
  {
    id: 'P-1',
    invoiceId: 'INV-3001',
    amount: 21000,
    date: '2026-02-05',
    method: 'Bank transfer',
  },
]

export default function ClientInvoices() {
  const event = eventsService.list()[0]
  const [myInvoices, setMyInvoices] = useState(() =>
    invoicesService.list().filter((i) => i.event === event.name)
  )
  // Only show payment history belonging to this client's own invoices.
  const [history, setHistory] = useState(() =>
    initialHistory.filter((payment) =>
      invoicesService.list().some(
        (invoice) => invoice.event === event.name && invoice.id === payment.invoiceId
      )
    )
  )
  const [payTarget, setPayTarget] = useState(null)

  const recordPayment = (invoice, amount) => {
    const paid = Math.min(invoice.paid + amount, invoice.amount)
    // Write through the service so the admin Payments page sees it too.
    invoicesService.update(invoice.id, {
      paid,
      status: paid >= invoice.amount ? 'Paid' : 'Partially Paid',
    })
    setMyInvoices(invoicesService.list().filter((i) => i.event === event.name))
    setHistory((prev) => [
      {
        id: `P-${prev.length + 1}`,
        invoiceId: invoice.id,
        amount,
        date: new Date().toISOString().slice(0, 10),
        method: 'Card ending in 4242',
      },
      ...prev,
    ])
  }

  const downloadReceipt = (payment) => {
    toast.success(`Downloading receipt for ${payment.invoiceId}...`, {
      description: `${formatCurrency(payment.amount)} · ${formatDate(payment.date)}`,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices & Payments"
        description="View balances and payment history for your event."
      />

      <div className="space-y-4">
        {myInvoices.map((invoice) => {
          const percentPaid = Math.round((invoice.paid / invoice.amount) * 100)
          const balance = invoice.amount - invoice.paid
          return (
            <Card key={invoice.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{invoice.id}</CardTitle>
                    <CardDescription>Due {formatDate(invoice.dueDate)}</CardDescription>
                  </div>
                  <Badge variant={statusVariant[invoice.status] ?? 'outline'}>
                    {invoice.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-display text-lg font-semibold">
                      {formatCurrency(invoice.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="font-display text-lg font-semibold">
                      {formatCurrency(invoice.paid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Balance Due</p>
                    <p className="font-display text-lg font-semibold">
                      {formatCurrency(balance)}
                    </p>
                  </div>
                </div>
                <Progress value={percentPaid} />
                {balance > 0 && (
                  <Button size="sm" onClick={() => setPayTarget(invoice)}>
                    <CreditCard className="size-4" />
                    Make a Payment
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5 text-muted-foreground" />
            Payment History
          </CardTitle>
          <CardDescription>
            {history.length} payment{history.length !== 1 ? 's' : ''} on record
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          )}
          {history.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                <p className="text-xs text-muted-foreground">
                  {payment.invoiceId} · {payment.method} · {formatDate(payment.date)}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => downloadReceipt(payment)}
              >
                <Download className="size-3.5" />
                Receipt
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <PaymentDialog
        invoice={payTarget}
        onOpenChange={(open) => !open && setPayTarget(null)}
        onPaid={recordPayment}
      />
    </div>
  )
}

function PaymentDialog({ invoice, onOpenChange, onPaid }) {
  const [amount, setAmount] = useState('')
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [processing, setProcessing] = useState(false)

  const balance = invoice ? invoice.amount - invoice.paid : 0

  const close = () => {
    onOpenChange(false)
    setAmount('')
    setCard('')
    setExpiry('')
    setCvc('')
    setProcessing(false)
  }

  const pay = (e) => {
    e.preventDefault()
    const value = Math.min(Number(amount) || 0, balance)
    if (value <= 0) return
    setProcessing(true)
    // Simulate a payment gateway round-trip (demo only, no backend).
    setTimeout(() => {
      onPaid(invoice, value)
      toast.success(`Payment of ${formatCurrency(value)} successful.`, {
        description: 'A receipt has been added to your payment history.',
      })
      close()
    }, 1200)
  }

  return (
    <Dialog open={!!invoice} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        {invoice && (
          <form onSubmit={pay} className="contents">
            <DialogHeader>
              <DialogTitle>Make a payment</DialogTitle>
              <DialogDescription>
                {invoice.id} · {formatCurrency(balance)} outstanding
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pay-amount">Amount</Label>
                <Input
                  id="pay-amount"
                  type="number"
                  min={1}
                  max={balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={String(balance)}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setAmount(String(balance))}
                  >
                    Pay full balance
                  </button>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setAmount(String(Math.round(balance / 2)))}
                  >
                    Pay half
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-card">Card number</Label>
                <Input
                  id="pay-card"
                  inputMode="numeric"
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pay-expiry">Expiry</Label>
                  <Input
                    id="pay-expiry"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pay-cvc">CVC</Label>
                  <Input
                    id="pay-cvc"
                    inputMode="numeric"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5" />
                Demo checkout — no real charge is made.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={close} disabled={processing}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing} className="gap-1.5">
                <CreditCard className="size-4" />
                {processing ? 'Processing...' : `Pay ${amount ? formatCurrency(Number(amount)) : ''}`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
