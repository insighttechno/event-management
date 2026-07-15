import { useEffect, useState } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { Plus, Phone, Video, Lock, Check, Ticket, ChevronLeft, ChevronRight, CalendarDays, List, Mail, Clock, CalendarClock, User } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
import { BackHeader } from '@/components/common/BackHeader'
import { BrandBadge } from '@/components/common/BrandBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { meetings as initialMeetings, adminEvents, meetingTypes } from '@/data/meetings'
import { packageBrands } from '@/data/packages'
import { formatDate } from '@/lib/utils'

const emptyForm = {
  client: '', email: '', brand: 'Family Affair', type: 'Google Meet',
  date: '', time: '', duration: '30 min', creditType: '30-min', status: 'Scheduled',
  sendEmail: true, note: '',
}

const TypeIcon = ({ type, className }) =>
  type === 'Phone Call' ? <Phone className={className} /> : <Video className={className} />

export default function Calendar() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [meetings, setMeetings] = useState(initialMeetings)
  const [view, setView] = useState('list')
  const [mode, setMode] = useState(searchParams.get('view') === 'month' ? 'calendar' : 'list') // list | calendar
  const [cursor, setCursor] = useState(new Date())
  const [form, setForm] = useState(emptyForm)
  const [confirmSave, setConfirmSave] = useState(false)
  const [completeTarget, setCompleteTarget] = useState(null)
  const [selected, setSelected] = useState(null) // meeting shown in the detail popup

  const calendarEvents = [
    ...meetings.map((m) => ({ date: m.date, title: m.client, time: m.time, kind: 'meeting', meeting: m })),
    ...adminEvents.map((e) => ({ date: e.date, title: e.title, time: e.time, kind: 'private' })),
  ]

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  // Arriving from a lead's "Schedule a meeting" button — open the form pre-filled for that client.
  useEffect(() => {
    const s = location.state?.scheduleFor
    if (s) {
      setForm({ ...emptyForm, client: s.client || '', email: s.email || '', brand: s.brand || emptyForm.brand })
      setView('form')
    }
  }, [location.state])

  const saveNow = () => {
    const id = `MT-${String(meetings.length + 1).padStart(2, '0')}`
    setMeetings((prev) => [{ ...form, id }, ...prev])
    if (form.sendEmail && form.email.trim()) {
      toast.success(`Meeting scheduled with ${form.client}. Invitation emailed to ${form.email.trim()}.`)
    } else {
      toast.success(`Meeting scheduled with ${form.client}. Added to the calendar.`)
    }
    setView('list')
  }

  const completeNow = () => {
    setMeetings((prev) => prev.map((m) => (m.id === completeTarget.id ? { ...m, status: 'Completed' } : m)))
    toast.success(`Session completed — 1 ${completeTarget.creditType} credit deducted.`)
  }

  if (view === 'form') {
    return (
      <div className="max-w-4xl">
        <BackHeader
          title="Schedule a meeting"
          description="Book a consultation. The client and admin calendars both update, and an invite is sent."
          backLabel="Back to calendar"
          onBack={() => setView('list')}
        />
        <Card>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Input value={form.client} onChange={(e) => setField('client', e.target.value)} placeholder="Sarah & James Whitfield" />
            </div>
            <div className="space-y-1.5">
              <Label>Client email</Label>
              <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="sarah.whitfield@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Select value={form.brand} onValueChange={(v) => setField('brand', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{packageBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Meeting type</Label>
              <Select value={form.type} onValueChange={(v) => setField('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{meetingTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input value={form.time} onChange={(e) => setField('time', e.target.value)} placeholder="10:00 AM" />
            </div>
            <div className="space-y-1.5">
              <Label>Duration / credit</Label>
              <Select value={form.creditType} onValueChange={(v) => setField('creditType', v === '1-hour' ? '1-hour' : '30-min') || setField('duration', v === '1-hour' ? '1 hour' : '30 min')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-hour">1 hour (1 credit)</SelectItem>
                  <SelectItem value="30-min">30 min (1 credit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl border border-border p-4 sm:col-span-2">
              <label className="flex items-start gap-3">
                <Checkbox checked={form.sendEmail} onCheckedChange={(v) => setField('sendEmail', v === true)} className="mt-0.5" />
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-medium"><Mail className="size-4 text-primary" />Email the meeting details to the client</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Sends a branded invitation with the date, time, {form.type === 'Phone Call' ? 'call details' : 'Google Meet link'} and an add-to-calendar link.
                  </span>
                </span>
              </label>
              {form.sendEmail && (
                <div className="mt-4 space-y-1.5 pl-7">
                  <Label>Personal message <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <textarea
                    value={form.note}
                    onChange={(e) => setField('note', e.target.value)}
                    rows={3}
                    placeholder="Looking forward to our call — feel free to bring any questions about your timeline."
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  />
                  {!form.email.trim() && (
                    <p className="text-xs text-amber-600">Add the client's email above to send the invitation.</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
              <Button className="gap-1.5" disabled={!form.client.trim() || !form.date || (form.sendEmail && !form.email.trim())} onClick={() => setConfirmSave(true)}>
                <Check className="size-4" />Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={confirmSave}
          onOpenChange={setConfirmSave}
          title="Schedule this meeting?"
          description={
            form.sendEmail && form.email.trim()
              ? `A ${form.type} with ${form.client || 'the client'} will be booked and an invitation emailed to ${form.email.trim()}.`
              : `A ${form.type} with ${form.client || 'the client'} will be booked and added to the calendar.`
          }
          confirmLabel="Schedule"
          confirmVariant="default"
          onConfirm={saveNow}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendar & Meetings"
        description="Consultations booked through the portal, plus your private admin calendar."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border p-0.5">
              <Button size="sm" variant={mode === 'list' ? 'secondary' : 'ghost'} className="gap-1.5" onClick={() => setMode('list')}>
                <List className="size-4" />List
              </Button>
              <Button size="sm" variant={mode === 'calendar' ? 'secondary' : 'ghost'} className="gap-1.5" onClick={() => setMode('calendar')}>
                <CalendarDays className="size-4" />Calendar
              </Button>
            </div>
            <Button className="gap-1.5" onClick={() => { setForm(emptyForm); setView('form') }}><Plus className="size-4" />Schedule meeting</Button>
          </div>
        }
      />

      {mode === 'calendar' && <MonthCalendar cursor={cursor} setCursor={setCursor} events={calendarEvents} onSelectMeeting={setSelected} />}

      {mode === 'list' && (
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Consultations</CardTitle>
            <CardDescription>Native scheduling — phone & Google Meet, tied to consultation credits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {meetings.map((m) => (
              <div
                key={m.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(m)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(m)}
                className="flex cursor-pointer flex-wrap items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/40 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TypeIcon type={m.type} className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{m.client}</p>
                    <BrandBadge brand={m.brand} className="shrink-0 px-1.5 text-[10px]" />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{m.type} · {m.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatDate(m.date)}</p>
                  <p className="text-xs text-muted-foreground">{m.time}</p>
                </div>
                <Badge variant="outline" className="gap-1"><Ticket className="size-3" />{m.creditType}</Badge>
                {m.status === 'Scheduled' ? (
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setCompleteTarget(m) }}>Mark done</Button>
                ) : (
                  <Badge className="bg-emerald-500/15 text-emerald-700" variant="secondary">Completed</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="size-4 text-muted-foreground" />Private calendar</CardTitle>
            <CardDescription>Only you can see this</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {adminEvents.map((e) => (
              <div key={e.id} className="flex items-start justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <Badge variant="outline" className="mt-1">{e.kind}</Badge>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium">{formatDate(e.date)}</p>
                  <p className="text-xs text-muted-foreground">{e.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      )}

      <ConfirmDialog
        open={!!completeTarget}
        onOpenChange={(open) => !open && setCompleteTarget(null)}
        title="Mark session complete?"
        description={completeTarget ? `This deducts 1 ${completeTarget.creditType} credit from ${completeTarget.client}'s package.` : ''}
        confirmLabel="Mark complete"
        confirmVariant="default"
        onConfirm={completeNow}
      />

      <MeetingDetailDialog
        meeting={selected}
        onClose={() => setSelected(null)}
        onMarkDone={(m) => { setSelected(null); setCompleteTarget(m) }}
      />
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function MeetingDetailDialog({ meeting, onClose, onMarkDone }) {
  const m = meeting
  return (
    <Dialog open={!!m} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {m && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <TypeIcon type={m.type} className="size-5" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="truncate text-base">{m.client}</DialogTitle>
                  <div className="mt-1 flex items-center gap-2">
                    <BrandBadge brand={m.brand} className="px-1.5 text-[10px]" />
                    {m.status === 'Scheduled' ? (
                      <Badge variant="outline" className="gap-1 text-[10px]"><span className="size-1.5 rounded-full bg-primary" />Scheduled</Badge>
                    ) : (
                      <Badge className="bg-emerald-500/15 text-[10px] text-emerald-700" variant="secondary">Completed</Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow icon={CalendarClock} label="Date" value={formatDate(m.date)} />
              <DetailRow icon={Clock} label="Time" value={`${m.time} · ${m.duration}`} />
              <DetailRow icon={m.type === 'Phone Call' ? Phone : Video} label="Type" value={m.type} />
              <DetailRow icon={Ticket} label="Credit" value={`${m.creditType} (1 credit)`} />
              {m.email && <DetailRow icon={Mail} label="Client email" value={m.email} />}
              {!m.email && <DetailRow icon={User} label="Attendee" value={m.client} />}
            </div>

            {m.note && (
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Personal message</p>
                <p className="mt-1 text-sm italic text-foreground/80">"{m.note}"</p>
              </div>
            )}

            {m.email && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="size-3.5 text-primary" />Invitation emailed to the client.
              </p>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              {m.status === 'Scheduled' && (
                <Button className="gap-1.5" onClick={() => onMarkDone(m)}>
                  <Check className="size-4" />Mark done
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function MonthCalendar({ cursor, setCursor, events, onSelectMeeting }) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const startDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = new Date().toISOString().slice(0, 10)
  const pad = (n) => String(n).padStart(2, '0')

  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const meetingCount = events.filter((e) => e.kind === 'meeting' && e.date.startsWith(`${year}-${pad(month + 1)}`)).length

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">{monthLabel}</CardTitle>
          <CardDescription className="mt-0.5">{meetingCount} consultation{meetingCount === 1 ? '' : 's'} this month · tap any meeting for details</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="size-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
          <Button variant="outline" size="icon-sm" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="size-4" /></Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
          {WEEKDAYS.map((w) => (
            <div key={w} className="bg-muted/60 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{w}</div>
          ))}
          {cells.map((d, i) => {
            const dateStr = d ? `${year}-${pad(month + 1)}-${pad(d)}` : null
            const dayEvents = d ? events.filter((e) => e.date === dateStr) : []
            const isToday = dateStr === todayStr
            return (
              <div key={i} className={cn('min-h-26 bg-card p-1.5 transition-colors', isToday && 'ring-1 ring-inset ring-primary/30')}>
                {d && (
                  <>
                    <div className={cn('mb-1 flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                      isToday ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground')}>
                      {d}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((e, j) =>
                        e.kind === 'meeting' ? (
                          <button
                            key={j}
                            type="button"
                            onClick={() => onSelectMeeting(e.meeting)}
                            title={`${e.time} · ${e.title} — view details`}
                            className="flex w-full items-center gap-1 truncate rounded-md border-l-2 border-primary bg-primary/12 px-1.5 py-1 text-left text-[10px] font-medium text-primary transition-colors hover:bg-primary/20"
                          >
                            <span className="shrink-0 opacity-70">{e.time}</span>
                            <span className="truncate">{e.title}</span>
                          </button>
                        ) : (
                          <div key={j}
                            title={`${e.time} · ${e.title}`}
                            className="flex items-center gap-1 truncate rounded-md border-l-2 border-foreground/30 bg-foreground/[0.06] px-1.5 py-1 text-[10px] font-medium text-foreground/80">
                            <Lock className="size-2.5 shrink-0 opacity-60" />
                            <span className="truncate">{e.title}</span>
                          </div>
                        ),
                      )}
                      {dayEvents.length > 3 && <p className="px-1 text-[10px] font-medium text-muted-foreground">+{dayEvents.length - 3} more</p>}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary/40" />Consultations</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-foreground/30" />Private events</span>
        </div>
      </CardContent>
    </Card>
  )
}
