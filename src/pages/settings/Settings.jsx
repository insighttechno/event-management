import { useState } from 'react'
import { Bell, Building2, Check, CreditCard, Palette, Save, ShieldCheck, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTenant } from '@/hooks/use-tenant'
import { plans } from '@/data/tenants'
import { teamService } from '@/services/team'
import { eventsService } from '@/services/events'

const permissionModules = [
  'Dashboard',
  'Leads',
  'Events',
  'Vendors',
  'Tasks',
  'Documents',
  'Gallery',
  'Payments',
  'Timeline',
  'Team',
]

const defaultTeamMemberPermissions = {
  Dashboard: true,
  Leads: true,
  Events: true,
  Vendors: true,
  Tasks: true,
  Documents: true,
  Gallery: true,
  Payments: false,
  Timeline: true,
  Team: false,
}

const notificationOptions = [
  { key: 'newLead', label: 'New lead received', defaultChecked: true },
  { key: 'paymentReceived', label: 'Payment received', defaultChecked: true },
  { key: 'contractSigned', label: 'Contract signed by client', defaultChecked: true },
  { key: 'taskDue', label: 'Task due reminders', defaultChecked: true },
  { key: 'approvalUpdates', label: 'Client approval updates', defaultChecked: false },
]

const brandColorOptions = [
  { name: 'Coral', value: 'oklch(0.65 0.16 35)' },
  { name: 'Ocean', value: 'oklch(0.55 0.12 220)' },
  { name: 'Palm', value: 'oklch(0.55 0.14 150)' },
  { name: 'Orchid', value: 'oklch(0.55 0.18 320)' },
  { name: 'Royal', value: 'oklch(0.5 0.16 280)' },
  { name: 'Gold', value: 'oklch(0.7 0.13 75)' },
]

export default function Settings() {
  const { tenant, plan, updateTenant, saasDemo, setSaasDemo } = useTenant()
  const [memberPermissions, setMemberPermissions] = useState(defaultTeamMemberPermissions)
  const [business, setBusiness] = useState({
    name: tenant.name,
    email: tenant.contactEmail,
    phone: tenant.phone,
    address: tenant.address,
  })
  const [workspace, setWorkspace] = useState({
    name: tenant.name,
    tagline: tenant.tagline,
    initials: tenant.initials,
  })
  const [notifications, setNotifications] = useState(
    Object.fromEntries(notificationOptions.map((opt) => [opt.key, opt.defaultChecked]))
  )

  const teamCount = teamService.list().length
  const eventCount = eventsService.list().length
  const storageUsedGb = 2.4

  const togglePermission = (module) => {
    setMemberPermissions((prev) => {
      const next = { ...prev, [module]: !prev[module] }
      toast.success(
        next[module]
          ? `Team Members can now access ${module}.`
          : `${module} access removed for Team Members.`
      )
      return next
    })
  }

  const saveBusiness = (e) => {
    e.preventDefault()
    updateTenant({
      name: business.name,
      contactEmail: business.email,
      phone: business.phone,
      address: business.address,
    })
    toast.success('Business profile saved.')
  }

  const saveWorkspace = (e) => {
    e.preventDefault()
    updateTenant({
      name: workspace.name,
      tagline: workspace.tagline,
      initials: workspace.initials.toUpperCase().slice(0, 2),
    })
    toast.success('Workspace branding updated.')
  }

  const setBrandColor = (color) => {
    updateTenant({ brandColor: color.value })
    toast.success(`Brand color changed to ${color.name}.`)
  }

  const choosePlan = (selected) => {
    if (selected.id === tenant.plan) return
    updateTenant({ plan: selected.id })
    toast.success(`Workspace moved to the ${selected.name} plan.`)
  }

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const limitLabel = (value) => (value === Infinity ? 'Unlimited' : value)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Business profile, workspace branding, plan and role permissions."
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          {saasDemo && <TabsTrigger value="workspace">Workspace & Branding</TabsTrigger>}
          {saasDemo && <TabsTrigger value="billing">Billing & Plan</TabsTrigger>}
        </TabsList>

        <TabsContent value="general" className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5 text-muted-foreground" />
                  Business Profile
                </CardTitle>
                <CardDescription>Shown on invoices, contracts and the client portal</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveBusiness} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="biz-name">Business name</Label>
                    <Input
                      id="biz-name"
                      value={business.name}
                      onChange={(e) => setBusiness((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="biz-email">Email</Label>
                      <Input
                        id="biz-email"
                        type="email"
                        value={business.email}
                        onChange={(e) => setBusiness((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="biz-phone">Phone</Label>
                      <Input
                        id="biz-phone"
                        value={business.phone}
                        onChange={(e) => setBusiness((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="biz-address">Address</Label>
                    <Input
                      id="biz-address"
                      value={business.address}
                      onChange={(e) => setBusiness((p) => ({ ...p, address: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" className="gap-1.5">
                    <Save className="size-4" />
                    Save changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="size-5 text-muted-foreground" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Choose which email alerts your team receives</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  {notificationOptions.map((option) => (
                    <label
                      key={option.key}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <span className="text-sm">{option.label}</span>
                      <Checkbox
                        checked={notifications[option.key]}
                        onCheckedChange={() => toggleNotification(option.key)}
                      />
                    </label>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="size-5 text-muted-foreground" />
                    SaaS Demo Mode
                  </CardTitle>
                  <CardDescription>
                    Shows the multi-workspace features: workspace switcher, branding, billing
                    and the platform console. Turn off for single-company client demos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50">
                    <span className="text-sm font-medium">
                      {saasDemo ? 'Enabled' : 'Disabled'}
                    </span>
                    <Checkbox
                      checked={saasDemo}
                      onCheckedChange={(checked) => {
                        setSaasDemo(!!checked)
                        toast.success(
                          checked ? 'SaaS demo mode enabled.' : 'SaaS demo mode disabled.'
                        )
                      }}
                    />
                  </label>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-muted-foreground" />
                Role Permissions
              </CardTitle>
              <CardDescription>
                Module access per role. Administrators always have full access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead className="text-center">Administrator</TableHead>
                    <TableHead className="text-center">Team Member</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissionModules.map((module) => (
                    <TableRow key={module}>
                      <TableCell className="font-medium">{module}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox checked disabled aria-label={`Administrator ${module} access`} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={memberPermissions[module]}
                          onCheckedChange={() => togglePermission(module)}
                          aria-label={`Team Member ${module} access`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {saasDemo && (
          <TabsContent value="workspace" className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5 text-muted-foreground" />
                  Workspace
                </CardTitle>
                <CardDescription>
                  How this workspace appears across the portal and to clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveWorkspace} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ws-name">Workspace name</Label>
                    <Input
                      id="ws-name"
                      value={workspace.name}
                      onChange={(e) => setWorkspace((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="ws-tagline">Tagline</Label>
                      <Input
                        id="ws-tagline"
                        value={workspace.tagline}
                        onChange={(e) => setWorkspace((p) => ({ ...p, tagline: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ws-initials">Logo initials</Label>
                      <Input
                        id="ws-initials"
                        maxLength={2}
                        value={workspace.initials}
                        onChange={(e) => setWorkspace((p) => ({ ...p, initials: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ws-domain">Workspace URL</Label>
                    <Input id="ws-domain" value={`${tenant.subdomain}.eventcrm.app`} disabled />
                    <p className="text-xs text-muted-foreground">
                      Custom domains will be available once the backend is connected.
                    </p>
                  </div>
                  <Button type="submit" className="gap-1.5">
                    <Save className="size-4" />
                    Save branding
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="size-5 text-muted-foreground" />
                  Brand Color
                </CardTitle>
                <CardDescription>
                  The accent color used across buttons, charts and the sidebar
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {brandColorOptions.map((color) => {
                  const active = tenant.brandColor === color.value
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setBrandColor(color)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors',
                        active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
                      )}
                    >
                      <span
                        className="flex size-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: color.value }}
                      >
                        {active && <Check className="size-5 text-white" />}
                      </span>
                      <span className="text-xs font-medium">{color.name}</span>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {saasDemo && (
          <TabsContent value="billing" className="mt-4 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-5 text-muted-foreground" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  This workspace is on the <span className="font-medium">{plan.name}</span> plan
                  — ${plan.price}/month
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Team members</span>
                    <span className="font-medium">
                      {teamCount} / {limitLabel(plan.limits.teamMembers)}
                    </span>
                  </div>
                  <Progress
                    value={
                      plan.limits.teamMembers === Infinity
                        ? 8
                        : (teamCount / plan.limits.teamMembers) * 100
                    }
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active events</span>
                    <span className="font-medium">
                      {eventCount} / {limitLabel(plan.limits.events)}
                    </span>
                  </div>
                  <Progress
                    value={
                      plan.limits.events === Infinity
                        ? 8
                        : (eventCount / plan.limits.events) * 100
                    }
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Storage</span>
                    <span className="font-medium">
                      {storageUsedGb} GB / {plan.limits.storageGb} GB
                    </span>
                  </div>
                  <Progress value={(storageUsedGb / plan.limits.storageGb) * 100} />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
              {plans.map((item) => {
                const current = item.id === tenant.plan
                return (
                  <Card key={item.id} className={cn(current && 'border-primary')}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        {current && <Badge>Current</Badge>}
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                      <p className="pt-1">
                        <span className="font-display text-3xl font-semibold">${item.price}</span>
                        <span className="text-sm text-muted-foreground"> /month</span>
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3">
                      <ul className="flex flex-col gap-1.5 text-sm">
                        {item.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={current ? 'outline' : 'default'}
                        disabled={current}
                        className="mt-auto"
                        onClick={() => choosePlan(item)}
                      >
                        {current ? 'Current plan' : `Switch to ${item.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Demo only — no real billing. Stripe/Razorpay integration comes with the backend.
            </p>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
