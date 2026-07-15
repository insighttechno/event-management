import { useState } from 'react'
import {
  CalendarClock, Video, Phone, Ticket, CheckCircle2, Plus, Clock, CalendarPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { StatStrip } from '@/components/common/StatStrip'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { resolveClient } from '@/lib/client-scope'
import { meetings as allMeetings, meetingTypes } from '@/data/meetings'
import { formatDate } from '@/lib/utils'

const typeIcon = (t) => (t === 'Phone Call' ? Phone : Video)

export default function ClientMeetings() {
  const { user, brand } = useAuth()
  const { cfg, me } = resolveClient(brand, user?.name)

  const creditsTotal = me?.creditsTotal ?? 0
  const creditsUsed = me?.creditsUsed ?? 0
  const creditsLeft = Math.max(0, creditsTotal - creditsUsed)

  const [meetings, setMeetings] = useState(allMeetings.filter((m) => m.client === me?.name))
  const upcoming = meetings.filter((m) => m.status === 'Scheduled')
  const past = meetings.filter((m) => m.status !== 'Scheduled')

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: 'Google Meet', date: '', time: '', note: '' })
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const requestMeeting = () => {
    const newMeeting = {
      id: `MT-${meetings.length + 90}`, client: me?.name, brand: cfg.short,
      type: form.type, date: form.date, time: form.time, duration: '30 min',
      creditType: '30-min', status: 'Scheduled', note: form.note,
    }
    setMeetings((prev) => [newMeeting, ...prev])
    setOpen(false)
    setForm({ type: 'Google Meet', date: '', time: '', note: '' })
    toast.success('Consultation requested.', {
      description: 'Your studio will confirm the slot and send a calendar invite.',
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Meetings & consultations"
        description="Book and track your consultation calls — each completed call uses one credit from your package."
        action={
          <Button className="gap-1.5" disabled={creditsLeft === 0} onClick={() => setOpen(true)}>
            <Plus className="size-4" />Book a consultation
          </Button>
        }
      />

      <StatStrip items={[
        { label: 'Credits remaining', value: creditsLeft, icon: Ticket, accent: 'primary' },
        { label: 'Scheduled', value: upcoming.length, icon: CalendarClock, accent: 'accent' },
        { label: 'Completed', value: past.length, icon: CheckCircle2, accent: 'secondary' },
      ]} />

      {creditsLeft === 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="p-4 text-sm text-muted-foreground">
            You've used all your consultation credits. Additional calls can be arranged with your studio —
            reach out any time and we'll help.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming</CardTitle>
          <CardDescription>{upcoming.length} scheduled consultation{upcoming.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No calls scheduled yet — book one above.</p>}
          {upcoming.map((m) => {
            const Icon = typeIcon(m.type)
            return (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{m.type} · {m.duration}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5" />{formatDate(m.date)} · {m.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{m.creditType} credit</Badge>
                  {m.type === 'Google Meet' && (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.info('The Google Meet link activates closer to your call.')}>
                      <Video className="size-3.5" />Join
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Past consultations</CardTitle>
          <CardDescription>Your consultation history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {past.length === 0 && <p className="text-sm text-muted-foreground">No past consultations yet.</p>}
          {past.map((m) => {
            const Icon = typeIcon(m.type)
            return (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4" /></span>
                  <div>
                    <p className="text-sm font-medium">{m.type} · {m.duration}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(m.date)} · {m.time}</p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1"><CheckCircle2 className="size-3" />{m.status}</Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book a consultation</DialogTitle>
            <DialogDescription>Pick a preferred time — your studio will confirm and send an invite.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Meeting type</Label>
              <Select value={form.type} onValueChange={(v) => setField('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{meetingTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Preferred date</Label>
                <Input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Preferred time</Label>
                <Input type="time" value={form.time} onChange={(e) => setField('time', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Anything you'd like to cover? <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea rows={3} value={form.note} onChange={(e) => setField('note', e.target.value)} placeholder="Topics or questions for the call…" />
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Ticket className="size-3.5" />This will use 1 of your {creditsLeft} remaining credits once completed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="gap-1.5" disabled={!form.date || !form.time} onClick={requestMeeting}>
              <CalendarPlus className="size-4" />Request consultation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
