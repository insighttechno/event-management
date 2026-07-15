import { useState } from 'react'
import {
  UserRound, Mail, Phone, CalendarHeart, MapPin, Package, Save, Camera,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { resolveClient } from '@/lib/client-scope'
import { formatDate } from '@/lib/utils'

const initialsOf = (name = '') =>
  name.split(/[\s&]+/).filter((p) => /^[a-z]/i.test(p)).map((p) => p[0].toUpperCase()).slice(0, 2).join('')

export default function ClientProfile() {
  const { user, brand } = useAuth()
  const { cfg, me, event } = resolveClient(brand, user?.name)

  const [form, setForm] = useState({
    name: me?.name ?? '',
    email: me?.email ?? '',
    phone: me?.phone ?? '',
  })
  const [saved, setSaved] = useState(form)
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const dirty = JSON.stringify(form) !== JSON.stringify(saved)

  const save = () => {
    setSaved(form)
    toast.success('Profile updated.')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My profile"
        description="Your contact details and event information."
      />

      {/* Identity header */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{initialsOf(form.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold">{form.name || 'Your name'}</p>
            <p className="text-sm text-muted-foreground">{cfg.name} · {me?.event}</p>
          </div>
          <Badge variant="secondary" className="gap-1"><Package className="size-3" />{me?.package}</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Editable contact details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><UserRound className="size-5 text-primary" />Contact details</CardTitle>
            <CardDescription>Keep these up to date so we can always reach you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={form.name} onChange={(e) => setField('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
            </div>
            <Button className="gap-1.5" disabled={!dirty} onClick={save}>
              <Save className="size-4" />Save changes
            </Button>
          </CardContent>
        </Card>

        {/* Read-only event details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {cfg.kind === 'gallery' ? <Camera className="size-5 text-primary" /> : <CalendarHeart className="size-5 text-primary" />}
              Your {cfg.eventNoun}
            </CardTitle>
            <CardDescription>Managed with your studio — reach out to change these.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow icon={CalendarHeart} label={cfg.kind === 'gallery' ? 'Session' : 'Event'} value={event?.name} />
            <InfoRow icon={CalendarHeart} label="Date" value={event?.date ? formatDate(event.date) : '—'} />
            <InfoRow icon={MapPin} label="Venue" value={event?.venue} />
            <InfoRow icon={Package} label="Package" value={me?.package} />
            <InfoRow icon={Mail} label="Email on file" value={saved.email} />
            <InfoRow icon={Phone} label="Phone on file" value={saved.phone} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2.5 last:border-0 last:pb-0">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="size-4" />{label}</span>
      <span className="truncate text-right font-medium">{value || '—'}</span>
    </div>
  )
}
