import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  DollarSign,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users2,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { platformRevenue, plans } from '@/data/tenants'
import { tenantsService } from '@/services/tenants'
import { superAdminAuth } from '@/services/superadmin'
import { useTenant } from '@/hooks/use-tenant'
import { formatDate } from '@/lib/utils'
import { consoleAccent } from './console-theme'

const statusStyles = {
  Active: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  Trial: 'bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30',
  Suspended: 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30',
}

const planColors = ['#a78bfa', '#8b5cf6', '#6d28d9']

function StatTile({ label, value, hint, icon: Icon, trend }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <div className="absolute -top-10 -right-10 size-28 rounded-full bg-[oklch(0.62_0.21_295)]/10 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1.5 font-display text-3xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.62_0.21_295)] to-[oklch(0.55_0.2_330)] shadow-lg shadow-[oklch(0.62_0.21_295)]/25">
          <Icon className="size-5 text-white" />
        </span>
      </div>
      {trend && (
        <span className="relative mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30">
          <TrendingUp className="size-3" />
          {trend}
        </span>
      )}
    </div>
  )
}

export default function SuperAdmin() {
  const navigate = useNavigate()
  const { switchTenant } = useTenant()
  const [tenants, setTenants] = useState(() => tenantsService.list())
  const [search, setSearch] = useState('')

  if (!superAdminAuth.isLoggedIn()) {
    return <Navigate to="/superadmin/login" replace />
  }

  const mrrFor = (tenant) =>
    tenant.status === 'Active' ? tenantsService.planFor(tenant).price : 0

  const activeCount = tenants.filter((t) => t.status === 'Active').length
  const trialCount = tenants.filter((t) => t.status === 'Trial').length
  const totalMrr = tenants.reduce((sum, t) => sum + mrrFor(t), 0)

  const planDistribution = plans.map((plan, index) => ({
    name: plan.name,
    value: tenants.filter((t) => t.plan === plan.id).length,
    color: planColors[index % planColors.length],
  }))

  const filteredTenants = tenants.filter((tenant) =>
    `${tenant.name} ${tenant.subdomain}`.toLowerCase().includes(search.trim().toLowerCase())
  )

  const recentSignups = [...tenants]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)

  const toggleSuspend = (tenant) => {
    const status = tenant.status === 'Suspended' ? 'Active' : 'Suspended'
    tenantsService.update(tenant.id, { status })
    setTenants(tenantsService.list())
    toast.success(
      status === 'Suspended'
        ? `"${tenant.name}" has been suspended.`
        : `"${tenant.name}" is active again.`
    )
  }

  const openWorkspace = (tenant) => {
    switchTenant(tenant.id)
    navigate('/admin/dashboard')
    toast.success(`Opened workspace "${tenant.name}".`)
  }

  const logout = () => {
    superAdminAuth.logout()
    toast.success('Signed out of the Platform Console.')
    navigate('/superadmin/login')
  }

  return (
    <div
      className="dark relative min-h-screen overflow-hidden bg-background text-foreground"
      style={consoleAccent}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/3 size-[520px] rounded-full bg-[oklch(0.62_0.21_295)]/12 blur-3xl" />
        <div className="absolute -bottom-48 -left-32 size-96 rounded-full bg-[oklch(0.55_0.18_250)]/10 blur-3xl" />
        <div className="absolute top-1/4 -right-32 size-96 rounded-full bg-[oklch(0.6_0.2_330)]/8 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.62_0.21_295)] to-[oklch(0.55_0.2_330)] shadow-lg shadow-[oklch(0.62_0.21_295)]/25">
            <ShieldCheck className="size-5 text-white" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold">Platform Console</p>
            <p className="text-xs text-muted-foreground">Event CRM Cloud</p>
          </div>

          <div className="relative ml-6 hidden max-w-xs flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workspaces..."
              className="border-border/60 bg-muted/30 pl-8"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <Link to="/admin/dashboard">
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Workspace portal</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={logout}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-6 p-4 py-8">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Sparkles className="size-4" />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Platform overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every workspace, plan and dollar across Event CRM Cloud.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Monthly Recurring Revenue"
            value={`$${totalMrr}`}
            icon={DollarSign}
            trend="+19.9% vs last month"
          />
          <StatTile
            label="Active Workspaces"
            value={activeCount}
            icon={Building2}
            trend="+1 this month"
          />
          <StatTile label="Trials in Progress" value={trialCount} icon={Users2} hint="14-day free trials" />
          <StatTile
            label="Total Workspaces"
            value={tenants.length}
            icon={ArrowUpRight}
            hint="All time"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl lg:col-span-2">
            <div className="mb-4">
              <h2 className="font-display text-lg font-semibold">Revenue growth</h2>
              <p className="text-sm text-muted-foreground">Platform MRR, last 6 months</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={platformRevenue}>
                  <defs>
                    <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
                    tickFormatter={(v) => `$${v}`}
                    width={48}
                  />
                  <Tooltip
                    formatter={(value) => [`$${value}/mo`, 'MRR']}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      fontSize: 13,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fill="url(#mrrFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
              <h2 className="font-display text-lg font-semibold">Plans</h2>
              <p className="text-sm text-muted-foreground">Workspaces per plan</p>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-32 w-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={38}
                        outerRadius={58}
                        paddingAngle={4}
                        strokeWidth={0}
                      >
                        {planDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} workspace${value === 1 ? '' : 's'}`, name]}
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid var(--border)',
                          background: 'var(--card)',
                          color: 'var(--foreground)',
                          fontSize: 13,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="flex flex-col gap-2 text-sm">
                  {planDistribution.map((entry) => (
                    <li key={entry.name} className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-muted-foreground">{entry.name}</span>
                      <span className="ml-auto font-medium">{entry.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
              <h2 className="font-display text-lg font-semibold">Recent signups</h2>
              <ul className="mt-3 flex flex-col gap-3">
                {recentSignups.map((tenant) => (
                  <li key={tenant.id} className="flex items-center gap-2.5">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
                      style={{ backgroundColor: tenant.brandColor }}
                    >
                      {tenant.initials}
                    </span>
                    <div className="min-w-0 leading-tight">
                      <p className="truncate text-sm font-medium">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tenant.createdAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium',
                        statusStyles[tenant.status]
                      )}
                    >
                      {tenant.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 p-5 pb-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Workspaces</h2>
              <p className="text-sm text-muted-foreground">
                {filteredTenants.length} of {tenants.length} shown
              </p>
            </div>
            <Badge variant="outline" className="border-border/60">
              ${totalMrr} MRR total
            </Badge>
          </div>
          <div className="px-5 pb-5">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Workspace</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                  <TableHead className="w-44" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id} className="border-border/60">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white shadow-sm"
                          style={{ backgroundColor: tenant.brandColor }}
                        >
                          {tenant.initials}
                        </span>
                        <div className="leading-tight">
                          <p className="text-sm font-medium">{tenant.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tenant.subdomain}.eventcrm.app
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{tenantsService.planFor(tenant).name}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium',
                          statusStyles[tenant.status]
                        )}
                      >
                        {tenant.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(tenant.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-medium">${mrrFor(tenant)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        {tenant.seeded && tenant.status !== 'Suspended' && (
                          <Button size="sm" variant="outline" onClick={() => openWorkspace(tenant)}>
                            Open
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={tenant.status === 'Suspended' ? 'default' : 'ghost'}
                          className={tenant.status !== 'Suspended' ? 'text-muted-foreground hover:text-rose-400' : ''}
                          onClick={() => toggleSuspend(tenant)}
                        >
                          {tenant.status === 'Suspended' ? 'Activate' : 'Suspend'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTenants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No workspaces match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Demo console — all data is in-memory. This becomes the real admin panel once the
          backend exists.
        </p>
      </main>
    </div>
  )
}
