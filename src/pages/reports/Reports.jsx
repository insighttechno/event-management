import { DollarSign, TrendingUp, Users, CalendarHeart } from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { leads, leadStages } from '@/data/leads'
import { events } from '@/data/events'
import { monthlyRevenue } from '@/data/finance'
import { clients } from '@/data/clients'
import { formatCurrency } from '@/lib/utils'

export default function Reports() {
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0)
  const won = leads.filter((l) => l.stage === 'Booked').length
  const conversion = Math.round((won / leads.length) * 100)

  const pipelineData = leadStages
    .filter((s) => s !== 'Closed')
    .map((stage) => ({ stage: stage.replace(' ', '\n'), count: leads.filter((l) => l.stage === stage).length }))

  const brandSplit = [
    { name: 'Family Affair', value: clients.filter((c) => c.brand === 'Family Affair').length, color: 'var(--chart-1)' },
    { name: 'Senses At Play', value: clients.filter((c) => c.brand === 'Senses At Play').length, color: 'var(--chart-3)' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" description="Business insight across Family Affair Key West & Senses At Play." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue (YTD)" value={formatCurrency(totalRevenue)} icon={DollarSign} hint="Both brands" accent="primary" trend="+18%" trendUp />
        <StatCard label="Lead conversion" value={`${conversion}%`} icon={TrendingUp} hint={`${won} booked of ${leads.length}`} accent="secondary" trend="+6%" trendUp />
        <StatCard label="Active clients" value={clients.length} icon={Users} hint="Across both brands" accent="accent" />
        <StatCard label="Events booked" value={events.length} icon={CalendarHeart} hint="This season" accent="navy" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Monthly revenue across both brands</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="repRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} width={42} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 8, borderColor: 'var(--border)', fontSize: 13 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" fill="url(#repRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients by brand</CardTitle>
            <CardDescription>Where the work sits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {brandSplit.map((b) => {
              const total = brandSplit.reduce((s, x) => s + x.value, 0) || 1
              return (
                <div key={b.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{b.name}</span>
                    <span className="text-muted-foreground">{b.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${(b.value / total) * 100}%`, background: b.color }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline by stage</CardTitle>
          <CardDescription>Active leads at each step</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="stage" tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={11} interval={0} />
              <YAxis tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} width={28} />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: 'var(--border)', fontSize: 13 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="var(--chart-1)">
                {pipelineData.map((_, i) => <Cell key={i} fill="var(--chart-1)" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
