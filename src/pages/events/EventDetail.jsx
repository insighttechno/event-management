import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarHeart,
  CheckCircle2,
  Circle,
  MapPin,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { events, eventVendorAssignments, eventNotes } from '@/data/events'
import { vendors } from '@/data/vendors'
import { contracts } from '@/data/finance'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function EventDetail() {
  const { id } = useParams()
  const event = events.find((item) => item.id === id)

  if (!event) {
    return <Navigate to="/admin/events" replace />
  }

  return <EventDetailView event={event} />
}

function EventDetailView({ event }) {
  const [milestones, setMilestones] = useState(event.milestones)
  const [assignedVendorIds, setAssignedVendorIds] = useState(
    eventVendorAssignments[event.id] ?? []
  )
  const [notes, setNotes] = useState(eventNotes[event.id] ?? [])
  const [newMilestone, setNewMilestone] = useState({ title: '', date: '' })
  const [vendorToAssign, setVendorToAssign] = useState('')
  const [newNote, setNewNote] = useState('')

  const doneCount = milestones.filter((m) => m.done).length
  const progress = milestones.length ? Math.round((doneCount / milestones.length) * 100) : 0

  const eventDocuments = useMemo(
    () => contracts.filter((contract) => contract.event === event.name),
    [event.name]
  )

  const assignedVendors = vendors.filter((vendor) => assignedVendorIds.includes(vendor.id))
  const availableVendors = vendors.filter((vendor) => !assignedVendorIds.includes(vendor.id))

  const toggleMilestone = (index) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, done: !m.done } : m))
    )
  }

  const addMilestone = (e) => {
    e.preventDefault()
    if (!newMilestone.title.trim()) return
    setMilestones((prev) =>
      [...prev, { ...newMilestone, done: false }].sort((a, b) =>
        (a.date || '9999').localeCompare(b.date || '9999')
      )
    )
    setNewMilestone({ title: '', date: '' })
    toast.success('Milestone added.')
  }

  const removeMilestone = (index) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index))
    toast.success('Milestone removed.')
  }

  const assignVendor = () => {
    if (!vendorToAssign) return
    const vendor = vendors.find((v) => v.id === vendorToAssign)
    setAssignedVendorIds((prev) => [...prev, vendorToAssign])
    setVendorToAssign('')
    toast.success(`${vendor.name} assigned to this event.`)
  }

  const removeVendor = (vendorId) => {
    const vendor = vendors.find((v) => v.id === vendorId)
    setAssignedVendorIds((prev) => prev.filter((id) => id !== vendorId))
    toast.success(`${vendor.name} removed from this event.`)
  }

  const addNote = (e) => {
    e.preventDefault()
    if (!newNote.trim()) return
    setNotes((prev) => [
      {
        id: `N-${prev.length + 1}`,
        text: newNote.trim(),
        by: 'You',
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ])
    setNewNote('')
    toast.success('Note added.')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 gap-1.5">
          <Link to="/admin/events">
            <ArrowLeft className="size-4" />
            All events
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold">{event.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarHeart className="size-4" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {event.venue}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4" />
                {event.guestCount} guests
              </span>
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {event.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Client</CardDescription>
            <CardTitle className="text-lg">{event.client}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Budget</CardDescription>
            <CardTitle className="text-lg">{formatCurrency(event.budget)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Planner</CardDescription>
            <CardTitle className="text-lg">{event.planner}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="milestones">
        <TabsList>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="vendors">Vendors ({assignedVendors.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({eventDocuments.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline & milestones</CardTitle>
              <CardDescription>
                {doneCount} of {milestones.length} complete
              </CardDescription>
              <Progress value={progress} className="mt-2" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {milestones.map((milestone, index) => (
                <div
                  key={`${milestone.title}-${index}`}
                  className="group flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  <button type="button" onClick={() => toggleMilestone(index)}>
                    {milestone.done ? (
                      <CheckCircle2 className="size-5 text-primary" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground/50" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        milestone.done
                          ? 'text-sm font-medium text-muted-foreground line-through'
                          : 'text-sm font-medium'
                      }
                    >
                      {milestone.title}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {milestone.date ? formatDate(milestone.date) : '—'}
                  </span>
                  <button
                    type="button"
                    className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                    onClick={() => removeMilestone(index)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              <form onSubmit={addMilestone} className="mt-2 flex flex-wrap gap-2">
                <Input
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone((p) => ({ ...p, title: e.target.value }))}
                  placeholder="New milestone..."
                  className="min-w-40 flex-1"
                />
                <Input
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone((p) => ({ ...p, date: e.target.value }))}
                  className="w-40"
                />
                <Button type="submit" className="gap-1.5">
                  <Plus className="size-4" />
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned vendors</CardTitle>
              <CardDescription>Vendors booked for this event</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {assignedVendors.length === 0 && (
                <p className="text-sm text-muted-foreground">No vendors assigned yet.</p>
              )}
              {assignedVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{vendor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {vendor.category} · {vendor.contact} · {vendor.phone}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => removeVendor(vendor.id)}>
                    Remove
                  </Button>
                </div>
              ))}

              <div className="mt-2 flex gap-2">
                <Select value={vendorToAssign} onValueChange={setVendorToAssign}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a vendor to assign..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name} · {vendor.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={assignVendor} disabled={!vendorToAssign} className="gap-1.5">
                  <Plus className="size-4" />
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Contracts and files linked to this event</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {eventDocuments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No documents linked to this event yet. Manage files from the Documents page.
                </p>
              ) : (
                eventDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.sentDate ? `Sent ${formatDate(doc.sentDate)}` : 'Not sent yet'}
                        {doc.signedDate && <> · Signed {formatDate(doc.signedDate)}</>}
                      </p>
                    </div>
                    <Badge variant={doc.status === 'Signed' ? 'secondary' : 'outline'}>
                      {doc.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes & documentation</CardTitle>
              <CardDescription>Internal notes for the planning team</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <form onSubmit={addNote} className="flex flex-col gap-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note for the team..."
                  rows={3}
                />
                <Button type="submit" size="sm" className="gap-1.5 self-start">
                  <Plus className="size-4" />
                  Add note
                </Button>
              </form>

              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm">{note.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {note.by} · {formatDate(note.date)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
