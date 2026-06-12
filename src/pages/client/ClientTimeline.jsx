import { useState } from 'react'
import { CheckCircle2, Circle, Clock, MessageSquarePlus, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
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
import { eventsService } from '@/services/events'
import { formatDate } from '@/lib/utils'

// Demo day-of schedule with vendor arrivals (no backend yet).
const dayOfSchedule = [
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

export default function ClientTimeline() {
  const event = eventsService.list()[0]
  const [requestOpen, setRequestOpen] = useState(false)
  const [requests, setRequests] = useState([])

  const submitRequest = (message) => {
    setRequests((prev) => [
      ...prev,
      { id: prev.length + 1, message, date: new Date().toISOString().slice(0, 10), status: 'Pending' },
    ])
    toast.success('Change request sent to your planner.')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Event Timeline"
        description="Key milestones leading up to your big day."
        action={
          <Button onClick={() => setRequestOpen(true)} className="gap-1.5">
            <MessageSquarePlus className="size-4" />
            Request a change
          </Button>
        }
      />

      <Tabs defaultValue="planning">
        <TabsList>
          <TabsTrigger value="planning">Planning milestones</TabsTrigger>
          <TabsTrigger value="dayof">Day-of schedule</TabsTrigger>
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
                {event.milestones.map((milestone) => (
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
                Day-of Schedule
              </CardTitle>
              <CardDescription>
                {formatDate(event.date)} — detailed run of show with vendor arrivals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-1">
                {dayOfSchedule.map((item) => (
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
              {requests.length} request{requests.length > 1 ? 's' : ''} sent to your planner
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
      />
    </div>
  )
}

function ChangeRequestDialog({ open, onOpenChange, onSubmit }) {
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
            <DialogTitle>Request a timeline change</DialogTitle>
            <DialogDescription>
              Tell your planner what you'd like to adjust — they'll review and get back to you.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Could we move the first look 30 minutes earlier?"
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
