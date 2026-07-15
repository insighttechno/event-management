import { Link } from 'react-router-dom'
import {
  Package, CheckCircle2, Ticket, CalendarClock, LifeBuoy, Sparkles,
  CreditCard, ArrowRight, Gem,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatStrip } from '@/components/common/StatStrip'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import { resolveClient } from '@/lib/client-scope'
import { packages } from '@/data/packages'
import { formatCurrency } from '@/lib/utils'

export default function ClientPackage() {
  const { user, brand } = useAuth()
  const { cfg, me } = resolveClient(brand, user?.name)

  const pkg =
    packages.find((p) => p.name === me?.package) ??
    packages.find((p) => p.brand === cfg.short) ??
    packages[0]

  const totalCredits = (pkg.oneHourCredits ?? 0) + (pkg.halfHourCredits ?? 0)
  const creditsUsed = me?.creditsUsed ?? 0
  const creditsLeft = Math.max(0, (me?.creditsTotal ?? totalCredits) - creditsUsed)
  const creditPct = (me?.creditsTotal ?? totalCredits)
    ? Math.round((creditsUsed / (me?.creditsTotal ?? totalCredits)) * 100)
    : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My package"
        description="Everything included in your plan, and how your consultation credits are tracked."
      />

      {/* Hero package card in the brand accent */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg lg:p-8"
        style={{ background: `linear-gradient(120deg, ${cfg.accentDark}, ${cfg.accent})` }}>
        <span className="pointer-events-none absolute -top-10 -right-8 size-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Gem className="size-3.5" />{cfg.name}
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold lg:text-3xl">{pkg.name}</h2>
            <p className="mt-1 text-sm text-white/85">{pkg.tagline}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-white/70">{pkg.priceUnit}</p>
            <p className="font-display text-3xl font-bold">{formatCurrency(pkg.price)}</p>
          </div>
        </div>
      </div>

      <StatStrip items={[
        { label: 'Consultation credits', value: `${creditsLeft} left`, icon: Ticket, accent: 'primary' },
        { label: 'Final payment', value: `${pkg.finalPaymentDays} days before`, icon: CreditCard, accent: 'navy' },
        { label: 'Full support opens', value: `${pkg.supportWindowDays} days before`, icon: LifeBuoy, accent: 'secondary' },
      ]} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Package className="size-5 text-primary" />What's included</CardTitle>
            <CardDescription>Your package covers the following</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {pkg.inclusions.map((inc) => (
                <li key={inc} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />{inc}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Ticket className="size-5 text-primary" />Your credits</CardTitle>
            <CardDescription>Consultation calls used</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className="font-semibold">{creditsUsed} / {me?.creditsTotal ?? totalCredits}</span>
              </div>
              <Progress value={creditPct} />
            </div>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              {pkg.oneHourCredits > 0 && <p className="flex items-center gap-2"><CalendarClock className="size-4 text-primary/70" />{pkg.oneHourCredits} × 1-hour planning call</p>}
              {pkg.halfHourCredits > 0 && <p className="flex items-center gap-2"><CalendarClock className="size-4 text-primary/70" />{pkg.halfHourCredits} × 30-minute check-in{pkg.halfHourCredits > 1 ? 's' : ''}</p>}
            </div>
            <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
              <Link to="/client/meetings"><CalendarClock className="size-4" />Book a consultation</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            Questions about upgrading or add-ons? Your studio is happy to help.
          </p>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to="/client/invoices">View invoices<ArrowRight className="size-3.5" /></Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
