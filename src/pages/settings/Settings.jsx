import { useState } from 'react'
import { Building2, Check, Plug, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const integrations = [
  { name: 'Gmail', desc: 'Send branded emails', connected: true },
  { name: 'Calendly', desc: 'Discovery-call booking', connected: true },
  { name: 'Google Calendar', desc: 'Two-way calendar sync', connected: true },
  { name: 'Adobe Acrobat Sign', desc: 'Contract e-signatures', connected: true },
  { name: 'QuickBooks Online', desc: 'Invoicing & payments', connected: false },
  { name: 'Pixieset', desc: 'Gallery delivery (Senses At Play)', connected: false },
]

const notificationPrefs = [
  { key: 'newLeads', label: 'New lead notifications', on: true },
  { key: 'payments', label: 'Payment received alerts', on: true },
  { key: 'reminders', label: 'Automated client reminders', on: true },
  { key: 'reviews', label: 'Post-event review requests', on: true },
]

export default function Settings() {
  const [business, setBusiness] = useState({
    name: 'Family Affair Key West', email: 'hello@familyaffairkeywest.com', phone: '(305) 433-0700',
  })
  const [prefs, setPrefs] = useState(Object.fromEntries(notificationPrefs.map((p) => [p.key, p.on])))
  const [confirmSave, setConfirmSave] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your business profile, integrations and notifications." />

      {/* Business profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Building2 className="size-4 text-primary" />Business profile</CardTitle>
          <CardDescription>Shown on emails, invoices and client-facing pages.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Business name</Label>
            <Input value={business.name} onChange={(e) => setBusiness((b) => ({ ...b, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Contact email</Label>
            <Input type="email" value={business.email} onChange={(e) => setBusiness((b) => ({ ...b, email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={business.phone} onChange={(e) => setBusiness((b) => ({ ...b, phone: e.target.value }))} />
          </div>
          <div className="flex items-end justify-end sm:col-span-2">
            <Button className="gap-1.5" onClick={() => setConfirmSave(true)}><Check className="size-4" />Save changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Plug className="size-4 text-primary" />Integrations</CardTitle>
          <CardDescription>Connect the tools that power the portal.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {integrations.map((it) => (
            <div key={it.name} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{it.name}</p>
                <p className="truncate text-xs text-muted-foreground">{it.desc}</p>
              </div>
              {it.connected
                ? <Badge className="bg-emerald-500/15 text-emerald-700" variant="secondary">Connected</Badge>
                : <Button size="sm" variant="outline" onClick={() => toast.success(`Connecting ${it.name}…`)}>Connect</Button>}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="size-4 text-primary" />Notifications</CardTitle>
          <CardDescription>Choose what the portal alerts you about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notificationPrefs.map((p) => (
            <label key={p.key} className="flex items-center gap-3">
              <Checkbox checked={prefs[p.key]} onCheckedChange={(v) => setPrefs((prev) => ({ ...prev, [p.key]: !!v }))} />
              <span className="text-sm">{p.label}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <ConfirmDialog open={confirmSave} onOpenChange={setConfirmSave}
        title="Save changes?" description="Your business profile will be updated across the portal."
        confirmLabel="Save" confirmVariant="default" onConfirm={() => toast.success('Settings saved.')} />
    </div>
  )
}
