import { useState } from 'react'
import {
  Bell, Mail, MessageSquare, CreditCard, Images, Lock, ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { resolveClient } from '@/lib/client-scope'

// Lightweight switch (no Switch component in the kit yet).
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-muted-foreground/25'
      )}
    >
      <span className={cn('inline-block size-4.5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5.5' : 'translate-x-1')} />
    </button>
  )
}

function PrefRow({ icon: Icon, title, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4.5" /></span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

export default function ClientSettings() {
  const { user, brand } = useAuth()
  const { cfg } = resolveClient(brand, user?.name)
  const isGallery = cfg.kind === 'gallery'

  const [prefs, setPrefs] = useState({
    email: true,
    sms: false,
    payment: true,
    milestone: true,
  })
  const setPref = (k, v) => setPrefs((p) => ({ ...p, [k]: v }))
  const [contact, setContact] = useState('Email')
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const setPwdField = (k, v) => setPwd((p) => ({ ...p, [k]: v }))

  const canChangePwd = pwd.current && pwd.next.length >= 6 && pwd.next === pwd.confirm

  const changePassword = () => {
    setPwd({ current: '', next: '', confirm: '' })
    toast.success('Password updated.')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage how we notify you and keep your account secure."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="size-5 text-primary" />Notifications</CardTitle>
          <CardDescription>Choose what you'd like to hear about.</CardDescription>
        </CardHeader>
        <CardContent className="py-0">
          <PrefRow icon={Mail} title="Email updates" desc="Important updates and messages from your studio." checked={prefs.email} onChange={(v) => setPref('email', v)} />
          <PrefRow icon={MessageSquare} title="SMS reminders" desc="Text reminders for calls and deadlines." checked={prefs.sms} onChange={(v) => setPref('sms', v)} />
          <PrefRow icon={CreditCard} title="Payment reminders" desc="Alerts before a payment is due." checked={prefs.payment} onChange={(v) => setPref('payment', v)} />
          <PrefRow
            icon={Images}
            title={isGallery ? 'Gallery ready alerts' : 'Milestone alerts'}
            desc={isGallery ? 'Be the first to know when your gallery is delivered.' : 'Updates as planning milestones are reached.'}
            checked={prefs.milestone}
            onChange={(v) => setPref('milestone', v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferred contact method</CardTitle>
          <CardDescription>How should we reach out first?</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={contact} onValueChange={setContact}>
            <SelectTrigger className="sm:w-64"><SelectValue /></SelectTrigger>
            <SelectContent>{['Email', 'Phone', 'Text message'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Lock className="size-5 text-primary" />Security</CardTitle>
          <CardDescription>Change your password.</CardDescription>
        </CardHeader>
        <CardContent className="grid max-w-md gap-4">
          <div className="space-y-1.5">
            <Label>Current password</Label>
            <Input type="password" value={pwd.current} onChange={(e) => setPwdField('current', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input type="password" value={pwd.next} onChange={(e) => setPwdField('next', e.target.value)} placeholder="At least 6 characters" />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm new password</Label>
            <Input type="password" value={pwd.confirm} onChange={(e) => setPwdField('confirm', e.target.value)} />
            {pwd.confirm && pwd.next !== pwd.confirm && <p className="text-xs text-destructive">Passwords don't match.</p>}
          </div>
          <Button className="gap-1.5" disabled={!canChangePwd} onClick={changePassword}>
            <ShieldCheck className="size-4" />Update password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
