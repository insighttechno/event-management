import { Inbox, CalendarHeart, DollarSign, ListChecks, Sparkles } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import { leads } from '@/data/leads'
import { events } from '@/data/events'
import { tasks } from '@/data/tasks'
import { invoices, contracts, monthlyRevenue } from '@/data/finance'
import { formatCurrency, formatDate } from '@/lib/utils'

function countBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1
    return acc
  }, {})
}

export default function Dashboard() {
  const { user } = useAuth()

  const newInquiries = leads.filter((lead) => lead.stage === 'New Inquiry')
  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4)
  const openTasks = tasks.filter((task) => task.status !== 'Done')
  const totalRevenueYTD = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0)
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const contractStatusCounts = countBy(contracts, 'status')
  const paymentStatusCounts = countBy(invoices, 'status')

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.32_0.05_220)] via-[oklch(0.38_0.06_230)] to-[oklch(0.48_0.07_160)] p-6 text-white shadow-lg lg:p-8">
        <div className="absolute -top-16 -right-16 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-24 size-40 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative">
          <p className="flex items-center gap-1.5 text-sm font-medium text-white/70">
            <Sparkles className="size-4" />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-white/80">
            Here's what's happening across Family Affair Key West &amp; Senses At Play.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="New Inquiries"
          value={newInquiries.length}
          icon={Inbox}
          hint="Awaiting first contact"
          accent="primary"
        />
        <StatCard
          label="Upcoming Events"
          value={events.length}
          icon={CalendarHeart}
          hint={`Next: ${formatDate(upcomingEvents[0]?.date)}`}
          accent="secondary"
        />
        <StatCard
          label="Revenue (YTD)"
          value={formatCurrency(totalRevenueYTD)}
          icon={DollarSign}
          hint="Across both businesses"
          accent="accent"
        />
        <StatCard
          label="Open Tasks"
          value={openTasks.length}
          icon={ListChecks}
          hint={`${tasks.length - openTasks.length} completed this month`}
          accent="navy"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue across Family Affair & Senses At Play</CardDescription>
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
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: 'var(--border)',
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  fill="url(#revenueFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
            <CardDescription>Contracts & payments at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium">Contracts</p>
              <div className="space-y-2">
                {Object.entries(contractStatusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{status}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Payments</p>
              <div className="space-y-2">
                {Object.entries(paymentStatusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{status}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
            <CardDescription>Latest leads across both businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.eventType}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.stage}</Badge>
                    </TableCell>
                    <TableCell>{lead.assignedTo}</TableCell>
                    <TableCell className="text-right">{formatCurrency(lead.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next on the calendar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{event.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{event.venue}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium">{formatDate(event.date)}</p>
                  <Badge variant="outline" className="mt-1">
                    {event.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
