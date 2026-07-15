// Which brand the admin is currently looking at. The sidebar switcher writes
// it; every admin page reads it. (Backend/user-preference replaces this later.)
//
// Brand lives on the CLIENT record — nothing else stores it. Contracts, events,
// tasks and documents all reference a person or event by name, so they derive
// their brand from that one source rather than carrying a stale copy.
import { getClients } from './clients-store'
import { getLeads } from './leads-store'
import { events } from '@/data/events'

export const ALL_BRANDS = 'all'

let activeBrand = ALL_BRANDS
const listeners = new Set()

export function getActiveBrand() {
  return activeBrand
}

export function setActiveBrand(next) {
  activeBrand = next
  listeners.forEach((listener) => listener())
}

export function subscribeActiveBrand(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Records name a person who may still be a LEAD, not yet a client — e.g.
// Olivia & Mark Reyes owns an event, contract, invoice and two documents while
// sitting at "Awaiting Approval". Checking clients only would strand them.
export function brandOfPerson(name) {
  if (!name) return null
  return (
    getClients().find((c) => c.name === name)?.brand ??
    getLeads().find((l) => l.name === name)?.brand ??
    null
  )
}

export function brandOfEvent(event) {
  if (!event) return null
  return event.brand ?? brandOfPerson(event.client)
}

// Tasks reference their event by name.
export function brandOfEventName(eventName) {
  if (!eventName) return null
  const match = events.find((e) => e.name === eventName)
  return match ? brandOfEvent(match) : null
}

// Rows whose brand can't be resolved stay VISIBLE. Silently hiding a real task
// or invoice because a name didn't match is worse than showing it under both
// brands — a lost task is a lost booking. (T-502 "Hayes Wedding (Lead)" has no
// matching event record, so it lands here.)
export function matchesBrand(brand, active) {
  if (!active || active === ALL_BRANDS) return true
  if (!brand) return true
  return brand === active
}
