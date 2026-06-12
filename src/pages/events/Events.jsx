import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { EntityFormDialog } from '@/components/common/EntityFormDialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { RowActions } from '@/components/common/RowActions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { events as initialEvents, eventStatuses } from '@/data/events'
import { formatCurrency, formatDate, nextSequentialId } from '@/lib/utils'

const eventFields = [
  { name: 'name', label: 'Event name', span: 'full', required: true },
  { name: 'client', label: 'Client', span: 'full' },
  { name: 'type', label: 'Event type' },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'venue', label: 'Venue', span: 'full' },
  { name: 'status', label: 'Status', type: 'select', options: eventStatuses },
  { name: 'guestCount', label: 'Guest count', type: 'number', min: 0 },
  { name: 'budget', label: 'Budget', type: 'number', min: 0 },
  { name: 'planner', label: 'Planner' },
]

const emptyEvent = {
  name: '',
  client: '',
  type: '',
  date: '',
  venue: '',
  status: 'Planning',
  guestCount: '',
  budget: '',
  planner: '',
}

export default function Events() {
  const [events, setEvents] = useState(initialEvents)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openAddDialog = () => {
    setEditingEvent(null)
    setFormOpen(true)
  }

  const openEditDialog = (event) => {
    setEditingEvent(event)
    setFormOpen(true)
  }

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      guestCount: Number(values.guestCount) || 0,
      budget: Number(values.budget) || 0,
    }

    if (editingEvent) {
      setEvents((prev) =>
        prev.map((event) => (event.id === editingEvent.id ? { ...event, ...payload } : event))
      )
      toast.success(`Event "${payload.name}" updated.`)
    } else {
      const newEvent = {
        ...payload,
        id: nextSequentialId(events, 'E'),
        milestones: [],
      }
      setEvents((prev) => [newEvent, ...prev])
      toast.success(`Event "${payload.name}" added.`)
    }
  }

  const handleDelete = () => {
    setEvents((prev) => prev.filter((event) => event.id !== deleteTarget.id))
    toast.success(`Event "${deleteTarget.name}" deleted.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Wedding & Event Management"
        description="All upcoming and past events for Family Affair Key West & Senses At Play."
        action={
          <Button onClick={openAddDialog} className="gap-1.5">
            <Plus className="size-4" />
            Add Event
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>{events.length} events on record</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 leading-none text-primary">
                {event.date ? (
                  <>
                    <span className="text-sm font-bold">
                      {new Date(event.date).getDate()}
                    </span>
                    <span className="text-[10px] font-medium uppercase">
                      {new Date(event.date).toLocaleString('en-US', { month: 'short' })}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] font-medium uppercase">TBD</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/admin/events/${event.id}`}
                  className="font-medium leading-tight hover:underline"
                >
                  {event.name}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {event.date ? formatDate(event.date) : 'Date TBD'} · {event.venue} ·{' '}
                  {event.guestCount} guests
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-sm font-medium sm:inline">
                  {formatCurrency(event.budget)}
                </span>
                <Badge variant="outline">{event.status}</Badge>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/admin/events/${event.id}`}>View</Link>
                </Button>
                <RowActions
                  onEdit={() => openEditDialog(event)}
                  onDelete={() => setDeleteTarget(event)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingEvent ? 'Edit Event' : 'Add Event'}
        description={
          editingEvent
            ? 'Update this event and save your changes.'
            : 'Add a new event to the calendar.'
        }
        fields={eventFields}
        defaultValues={editingEvent ?? emptyEvent}
        onSubmit={handleSubmit}
        submitLabel={editingEvent ? 'Save changes' : 'Add event'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this event?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. This cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
      />
    </div>
  )
}
