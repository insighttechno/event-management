import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, GanttChartSquare, Plus, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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
import { events as initialEvents } from '@/data/events'
import { cn, formatDate } from '@/lib/utils'

const milestoneFields = [
  { name: 'title', label: 'Milestone', span: 'full', required: true },
  { name: 'date', label: 'Date', type: 'date' },
]

const emptyMilestone = { title: '', date: '' }

export default function Timeline() {
  const [events, setEvents] = useState(initialEvents)
  const [milestoneDialog, setMilestoneDialog] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [approvalStatus, setApprovalStatus] = useState({})

  // Upcoming work across all events, grouped by month — easier to scan than a Gantt chart.
  const upcomingByMonth = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const items = events
      .flatMap((event) =>
        (event.milestones ?? [])
          .filter((m) => !m.done && m.date && m.date >= today)
          .map((m) => ({ ...m, eventName: event.name, eventId: event.id }))
      )
      .sort((a, b) => a.date.localeCompare(b.date))

    const groups = new Map()
    for (const item of items) {
      const month = new Date(item.date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
      if (!groups.has(month)) groups.set(month, [])
      groups.get(month).push(item)
    }
    return [...groups.entries()]
  }, [events])

  const daysAway = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.ceil((new Date(date) - today) / 86400000)
  }

  const requestApproval = (event) => {
    setApprovalStatus((prev) => ({ ...prev, [event.id]: 'Pending client approval' }))
    toast.success(`Timeline for "${event.name}" sent to ${event.client} for approval.`)
  }

  const openAddMilestone = (eventId) => {
    setMilestoneDialog({ eventId, index: null, defaultValues: emptyMilestone })
  }

  const openEditMilestone = (eventId, index, milestone) => {
    setMilestoneDialog({
      eventId,
      index,
      defaultValues: { title: milestone.title, date: milestone.date },
    })
  }

  const handleMilestoneSubmit = (values) => {
    const { eventId, index } = milestoneDialog
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event
        const milestones = [...(event.milestones ?? [])]
        if (index === null) {
          milestones.push({ ...values, done: false })
        } else {
          milestones[index] = { ...milestones[index], ...values }
        }
        return { ...event, milestones }
      })
    )
    toast.success(index === null ? 'Milestone added.' : 'Milestone updated.')
  }

  const toggleMilestone = (eventId, index) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event
        const milestones = event.milestones.map((milestone, i) =>
          i === index ? { ...milestone, done: !milestone.done } : milestone
        )
        return { ...event, milestones }
      })
    )
  }

  const handleDeleteMilestone = () => {
    const { eventId, index } = deleteTarget
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event
        return { ...event, milestones: event.milestones.filter((_, i) => i !== index) }
      })
    )
    toast.success('Milestone deleted.')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Event Timeline Management"
        description="Schedules and milestones for every event, visible to staff and clients."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GanttChartSquare className="size-5 text-muted-foreground" />
            Upcoming Milestones
          </CardTitle>
          <CardDescription>
            What's due next across all events, month by month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingByMonth.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No upcoming milestones — you're all caught up.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {upcomingByMonth.map(([month, items]) => (
                <div key={month}>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {month}
                  </p>
                  <div className="flex flex-col gap-2">
                    {items.map((item) => {
                      const days = daysAway(item.date)
                      return (
                        <div
                          key={`${item.eventId}-${item.title}`}
                          className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 leading-none text-primary">
                            <span className="text-sm font-bold">
                              {new Date(item.date).getDate()}
                            </span>
                            <span className="text-[10px] font-medium uppercase">
                              {new Date(item.date).toLocaleString('en-US', { month: 'short' })}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.eventName}
                            </p>
                          </div>
                          <Badge
                            variant={days <= 7 ? 'destructive' : days <= 30 ? 'secondary' : 'outline'}
                            className="shrink-0"
                          >
                            {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{event.name}</CardTitle>
                  <CardDescription>
                    {formatDate(event.date)} &middot; {event.venue}
                  </CardDescription>
                </div>
                {approvalStatus[event.id] ? (
                  <Badge variant="secondary" className="shrink-0">
                    {approvalStatus[event.id]}
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    onClick={() => requestApproval(event)}
                  >
                    <Send className="size-3.5" />
                    Request approval
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(event.milestones ?? []).map((milestone, index) => (
                  <li key={`${milestone.title}-${index}`} className="flex items-center gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => toggleMilestone(event.id, index)}
                      className="shrink-0"
                      aria-label={milestone.done ? 'Mark as not done' : 'Mark as done'}
                    >
                      {milestone.done ? (
                        <CheckCircle2 className="size-4 text-secondary" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground" />
                      )}
                    </button>
                    <span className={cn('flex-1', milestone.done ? '' : 'text-muted-foreground')}>
                      {milestone.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(milestone.date)}
                    </span>
                    <RowActions
                      onEdit={() => openEditMilestone(event.id, index, milestone)}
                      onDelete={() => setDeleteTarget({ eventId: event.id, index, title: milestone.title })}
                    />
                  </li>
                ))}
                {(event.milestones ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No milestones yet.</p>
                )}
              </ul>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full gap-1.5"
                onClick={() => openAddMilestone(event.id)}
              >
                <Plus className="size-3.5" />
                Add Milestone
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <EntityFormDialog
        open={!!milestoneDialog}
        onOpenChange={(open) => !open && setMilestoneDialog(null)}
        title={milestoneDialog?.index === null ? 'Add Milestone' : 'Edit Milestone'}
        description={
          milestoneDialog?.index === null
            ? 'Add a new milestone to this event.'
            : 'Update this milestone and save your changes.'
        }
        fields={milestoneFields}
        defaultValues={milestoneDialog?.defaultValues ?? emptyMilestone}
        onSubmit={handleMilestoneSubmit}
        submitLabel={milestoneDialog?.index === null ? 'Add milestone' : 'Save changes'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this milestone?"
        description={
          deleteTarget ? `"${deleteTarget.title}" will be permanently removed.` : ''
        }
        onConfirm={handleDeleteMilestone}
      />
    </div>
  )
}
