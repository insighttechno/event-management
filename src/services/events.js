// Event data access (incl. milestones, notes, vendor assignments).
import { events, eventNotes, eventVendorAssignments } from '@/data/events'
import { createCollection } from './store'

const collection = createCollection(events, 'E')

let notes = { ...eventNotes }
let assignments = { ...eventVendorAssignments }

export const eventsService = {
  ...collection,
  notesFor(eventId) {
    return notes[eventId] ?? []
  },
  addNote(eventId, note) {
    const existing = notes[eventId] ?? []
    notes = {
      ...notes,
      [eventId]: [{ ...note, id: `N-${existing.length + 1}` }, ...existing],
    }
    return notes[eventId]
  },
  vendorIdsFor(eventId) {
    return assignments[eventId] ?? []
  },
  assignVendor(eventId, vendorId) {
    assignments = {
      ...assignments,
      [eventId]: [...(assignments[eventId] ?? []), vendorId],
    }
    return assignments[eventId]
  },
  unassignVendor(eventId, vendorId) {
    assignments = {
      ...assignments,
      [eventId]: (assignments[eventId] ?? []).filter((id) => id !== vendorId),
    }
    return assignments[eventId]
  },
}
