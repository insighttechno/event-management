import { useNavigate } from 'react-router-dom'
import {
  Inbox,
  CalendarHeart,
  DollarSign,
  Signature,
  TrendingUp,
  CircleAlert,
  CreditCard,
  ArrowRight,
  Clock,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { StatCard } from '@/components/common/StatCard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import { leads, leadStages } from '@/data/leads'
import { events } from '@/data/events'
import { invoices, contracts, monthlyRevenue } from '@/data/finance'
import { formatCurrency, formatDate } from '@/lib/utils'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const today = new Date()

  const newInquiries = leads.filter((lead) => lead.stage === 'New Inquiry')
  const upcomingEvents = [...events]
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  const totalRevenueYTD = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0)
  const awaitingSignature = contracts.filter((c) => c.status === 'Awaiting Signature')
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // Active pipeline (a lost/"Closed" lead is not in the funnel)
  const funnelStages = leadStages.filter((s) => s !== 'Closed')
  const pipeline = funnelStages.map((stage) => ({
    stage,
    count: leads.filter((l) => l.stage === stage).length,
  }))
  const maxCount = Math.max(1, ...pipeline.map((p) => p.count))

  // "Needs attention" — the few things an admin should act on today
  const unpaidInvoices = invoices.filter((i) => i.status !== 'Paid')
  const attention = [
    ...awaitingSignature.map((c) => ({
      id: c.id,
      icon: Signature,
      title: `${c.client} — awaiting signature`,
      sub: c.title,
      to: '/admin/contracts',
    })),
    ...unpaidInvoices.slice(0, 3).map((i) => ({
      id: i.id,
      icon: CreditCard,
      title: `${i.client} — ${i.status.toLowerCase()}`,
      sub: `${formatCurrency(i.amount - i.paid)} of ${formatCurrency(i.amount)} outstanding`,
      to: '/admin/payments',
    })),
  ]

  const stageTone = (stage) =>
    stage === 'Booked'
      ? 'text-primary'
      : stage === 'Awaiting Approval'
      ? 'text-amber-600'
      : 'text-foreground'

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here's what needs you across Family Affair Key West &amp; Senses At Play.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/calendar?view=month')}>
            Open calendar
          </Button>
          <Button className="gap-2" onClick={() => navigate('/admin/leads')}>
            <Inbox className="size-4" />
            Review leads
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="New inquiries"
          value={newInquiries.length}
          icon={Inbox}
          hint="Awaiting first contact"
          accent="primary"
          trend="+2 this week"
          trendUp
        />
        <StatCard
          label="Upcoming events"
          value={upcomingEvents.length}
          icon={CalendarHeart}
          hint={upcomingEvents[0] ? `Next: ${formatDate(upcomingEvents[0].date)}` : 'None scheduled'}
          accent="secondary"
        />
        <StatCard
          label="Revenue (YTD)"
          value={formatCurrency(totalRevenueYTD)}
          icon={DollarSign}
          hint="Across both brands"
          accent="accent"
          trend="+18%"
          trendUp
        />
        <StatCard
          label="Awaiting signature"
          value={awaitingSignature.length}
          icon={Signature}
          hint="Contracts sent, not signed"
          accent="navy"
        />
      </div>

      {/* Pipeline */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Leads pipeline</CardTitle>
            <CardDescription>Where every active inquiry stands right now</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/admin/leads')}>
            View all <ArrowRight className="size-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {pipeline.map((p) => (
              <div key={p.stage} className="rounded-xl border border-border bg-muted/30 p-3">
                <p className={`font-display text-2xl font-semibold ${stageTone(p.stage)}`}>{p.count}</p>
                <p className="mt-0.5 line-clamp-2 min-h-8 text-xs font-medium text-muted-foreground">
                  {p.stage}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${(p.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue + Needs attention */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue overview</CardTitle>
            <CardDescription>Monthly revenue across both brands</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} />
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
                  contentStyle={{ borderRadius: 8, borderColor: 'var(--border)', fontSize: 13 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" fill="url(#revenueFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleAlert className="size-4 text-amber-500" />
              Needs attention
            </CardTitle>
            <CardDescription>Act on these today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {attention.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">All caught up 🎉</p>
            ) : (
              attention.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <item.icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent inquiries + upcoming events */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent inquiries</CardTitle>
              <CardDescription>Latest leads across both brands</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/admin/leads')}>
              View all <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.eventType}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.stage}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(lead.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Upcoming events</CardTitle>
              <CardDescription>Next on the calendar</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="size-3" />
              {upcomingEvents.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{event.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{event.venue}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium">{formatDate(event.date)}</p>
                  <Badge variant="outline" className="mt-1">{event.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
