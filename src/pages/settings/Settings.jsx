import { useState } from 'react'
import { Bell, Building2, Save, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

export default function Settings() {
  const [memberPermissions, setMemberPermissions] = useState(defaultTeamMemberPermissions)
  const [business, setBusiness] = useState({
    name: 'Family Affair Key West',
    email: 'hello@familyaffairkeywest.com',
    phone: '(305) 555-0100',
    address: '500 Duval Street, Key West, FL 33040',
  })
  const [notifications, setNotifications] = useState(
    Object.fromEntries(notificationOptions.map((opt) => [opt.key, opt.defaultChecked]))
  )

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
    toast.success('Business profile saved.')
  }

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Business profile, role permissions and notification preferences."
      />

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
    </div>
  )
}
