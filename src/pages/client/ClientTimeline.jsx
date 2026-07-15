import { useState } from 'react'
import { CheckCircle2, Circle, Clock, MessageSquarePlus, Truck, CalendarHeart, ListChecks, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { StatStrip } from '@/components/common/StatStrip'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { resolveClient } from '@/lib/client-scope'
import { formatDate, daysUntil } from '@/lib/utils'

// Wedding-day run of show with vendor arrivals (Family Affair / planning brands).
const weddingDaySchedule = [
  { time: '10:00 AM', title: 'Vendor load-in begins', detail: 'Key West Tents & Events — arch, chairs and lighting setup', type: 'vendor' },
  { time: '12:30 PM', title: 'Florals arrive', detail: 'Coral Blooms Florals — ceremony arch and centerpieces', type: 'vendor' },
  { time: '1:00 PM', title: 'Hair & makeup', detail: 'Bridal suite at Casa Marina Resort', type: 'event' },
  { time: '3:00 PM', title: 'Catering arrives', detail: 'Conch Republic Catering — kitchen setup and bar stocking', type: 'vendor' },
  { time: '3:30 PM', title: 'First look photos', detail: 'Beachfront with John McCall', type: 'event' },
  { time: '4:30 PM', title: 'Guests arrive', detail: 'Welcome drinks at the ceremony entrance', type: 'event' },
  { time: '5:00 PM', title: 'Ceremony', detail: 'Smathers Beach — 30 minutes', type: 'event' },
  { time: '5:45 PM', title: 'Cocktail hour', detail: 'Island Sounds DJ Co. — acoustic set', type: 'event' },
  { time: '7:00 PM', title: 'Reception & dinner', detail: 'Tent on the beach lawn', type: 'event' },
  { time: '10:30 PM', title: 'Send-off', detail: 'Sparkler exit', type: 'event' },
]

// Shoot-day schedule for photography brands (Senses At Play / gallery).
const shootDaySchedule = [
  { time: '4:30 PM', title: 'Golden-hour arrival', detail: 'Meet your photographer on location', type: 'event' },
  { time: '4:45 PM', title: 'Warm-up & candids', detail: 'Relaxed shots to help you settle in', type: 'event' },
  { time: '5:15 PM', title: 'Couple portraits', detail: 'Posed and natural portraits along the shoreline', type: 'event' },
  { time: '5:45 PM', title: 'Second look', detail: 'Optional outfit change', type: 'event' },
  { time: '6:15 PM', title: 'Sunset session', detail: 'The very best light of the day', type: 'event' },
  { time: '6:45 PM', title: 'Wrap & next steps', detail: 'We walk you through your gallery delivery timeline', type: 'event' },
]

export default function ClientTimeline() {
  const { user, brand } = useAuth()
  const { cfg, event } = resolveClient(brand, user?.name)
  const isGallery = cfg.kind === 'gallery'
  const schedule = isGallery ? shootDaySchedule : weddingDaySchedule

  const [requestOpen, setRequestOpen] = useState(false)
  const [requests, setRequests] = useState([])
  const milestones = event.milestones ?? []
  const doneCount = milestones.filter((m) => m.done).length

  const submitRequest = (message) => {
    setRequests((prev) => [
      ...prev,
      { id: prev.length + 1, message, date: new Date().toISOString().slice(0, 10), status: 'Pending' },
    ])
    toast.success('Change request sent to your team.')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isGallery ? 'Session timeline' : 'Event timeline'}
        description={isGallery ? 'Your session milestones and shoot-day flow.' : 'Key milestones leading up to your big day.'}
        action={
          <Button onClick={() => setRequestOpen(true)} className="gap-1.5">
            <MessageSquarePlus className="size-4" />
            Request a change
          </Button>
        }
      />

      <StatStrip items={
        isGallery
          ? [
            { label: 'Milestones done', value: `${doneCount}/${milestones.length}`, icon: ListChecks, accent: 'secondary' },
            { label: 'Shoot day', value: formatDate(event.date), icon: Camera, accent: 'primary' },
            { label: 'Shoot-day steps', value: schedule.length, icon: Clock, accent: 'navy' },
          ]
          : [
            { label: 'Days to go', value: daysUntil(event.date), icon: CalendarHeart, accent: 'primary' },
            { label: 'Milestones done', value: `${doneCount}/${milestones.length}`, icon: ListChecks, accent: 'secondary' },
            { label: 'Run of show', value: schedule.length, icon: Clock, accent: 'navy' },
          ]
      } />

      <Tabs defaultValue="planning">
        <TabsList>
          <TabsTrigger value="planning">{isGallery ? 'Session milestones' : 'Planning milestones'}</TabsTrigger>
          <TabsTrigger value="dayof">{isGallery ? 'Shoot-day schedule' : 'Day-of schedule'}</TabsTrigger>
        </TabsList>

        <TabsContent value="planning" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <CardDescription>
                {formatDate(event.date)} &middot; {event.venue}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 border-l border-border pl-5">
                {milestones.map((milestone) => (
                  <li key={milestone.title} className="relative">
                    <span className="absolute -left-[1.65rem] flex size-4 items-center justify-center rounded-full bg-background">
                      {milestone.done ? (
                        <CheckCircle2 className="size-4 text-secondary" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground" />
                      )}
                    </span>
                    <p
                      className={`text-sm font-medium ${milestone.done ? '' : 'text-muted-foreground'}`}
                    >
                      {milestone.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(milestone.date)}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dayof" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5 text-muted-foreground" />
                {isGallery ? 'Shoot-day schedule' : 'Day-of schedule'}
              </CardTitle>
              <CardDescription>
                {formatDate(event.date)} — {isGallery ? 'how your session flows, hour by hour' : 'detailed run of show with vendor arrivals'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-1">
                {schedule.map((item) => (
                  <li
                    key={`${item.time}-${item.title}`}
                    className="flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <span className="w-20 shrink-0 pt-0.5 text-sm font-semibold tabular-nums">
                      {item.time}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        {item.title}
                        {item.type === 'vendor' && (
                          <Badge variant="outline" className="gap-1 text-[10px]">
                            <Truck className="size-3" />
                            Vendor arrival
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your change requests</CardTitle>
            <CardDescription>
              {requests.length} request{requests.length > 1 ? 's' : ''} sent to your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm">{request.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Sent {formatDate(request.date)}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {request.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ChangeRequestDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        onSubmit={submitRequest}
        isGallery={isGallery}
      />
    </div>
  )
}

function ChangeRequestDialog({ open, onOpenChange, onSubmit, isGallery }) {
  const [message, setMessage] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    onSubmit(message.trim())
    setMessage('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="contents">
          <DialogHeader>
            <DialogTitle>Request a change</DialogTitle>
            <DialogDescription>
              Tell your team what you'd like to adjust — they'll review and get back to you.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isGallery
              ? 'e.g. Could we start the session a little earlier for the light?'
              : 'e.g. Could we move the first look 30 minutes earlier?'}
            rows={4}
            required
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!message.trim()}>
              Send request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
