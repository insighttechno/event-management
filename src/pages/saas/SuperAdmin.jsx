import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  DollarSign,
  ShieldCheck,
  Users2,
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
import { toast } from 'sonner'
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
import { StatCard } from '@/components/common/StatCard'
import { platformRevenue } from '@/data/tenants'
import { tenantsService } from '@/services/tenants'
import { useTenant } from '@/hooks/use-tenant'
import { formatDate } from '@/lib/utils'

const statusVariant = {
  Active: 'secondary',
  Trial: 'outline',
  Suspended: 'destructive',
}

export default function SuperAdmin() {
  const navigate = useNavigate()
  const { switchTenant } = useTenant()
  const [tenants, setTenants] = useState(() => tenantsService.list())

  const mrrFor = (tenant) =>
    tenant.status === 'Active' ? tenantsService.planFor(tenant).price : 0

  const activeCount = tenants.filter((t) => t.status === 'Active').length
  const trialCount = tenants.filter((t) => t.status === 'Trial').length
  const totalMrr = tenants.reduce((sum, t) => sum + mrrFor(t), 0)

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

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
            <ShieldCheck className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold">Platform Console</p>
            <p className="text-xs text-muted-foreground">Event CRM Cloud · Super Admin</p>
          </div>
          <Button asChild variant="outline" size="sm" className="ml-auto gap-1.5">
            <Link to="/admin/dashboard">
              <ArrowLeft className="size-4" />
              Back to portal
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active Workspaces" value={activeCount} icon={Building2} accent="primary" />
          <StatCard label="Trials" value={trialCount} icon={Users2} accent="secondary" />
          <StatCard
            label="Monthly Recurring Revenue"
            value={`$${totalMrr}`}
            icon={DollarSign}
            accent="accent"
          />
          <StatCard
            label="Total Workspaces"
            value={tenants.length}
            icon={ArrowUpRight}
            hint="All time"
            accent="navy"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Revenue</CardTitle>
            <CardDescription>Monthly recurring revenue across all workspaces</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformRevenue}>
                <defs>
                  <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
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
                  tickFormatter={(v) => `$${v}`}
                  width={48}
                />
                <Tooltip
                  formatter={(value) => `$${value}/mo`}
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: 'var(--border)',
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="var(--chart-1)"
                  fill="url(#mrrFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspaces</CardTitle>
            <CardDescription>
              Every company using the platform — {tenants.length} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                  <TableHead className="w-44" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
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
                      <Badge variant={statusVariant[tenant.status] ?? 'outline'}>
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                    <TableCell className="text-right">${mrrFor(tenant)}</TableCell>
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
                          onClick={() => toggleSuspend(tenant)}
                        >
                          {tenant.status === 'Suspended' ? 'Activate' : 'Suspend'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Demo console — all data is in-memory. This becomes the real admin panel once the
          backend exists.
        </p>
      </main>
    </div>
  )
}
