// Shared in-memory lead pipeline. The list page and the dedicated lead detail
// page are separate routes, so the data has to live outside both of them —
// otherwise advancing a lead on one screen wouldn't show on the other.
// (Backend replaces this later.)
import { leads as seed, leadCommunications as commsSeed } from '@/data/leads'

let leads = [...seed]
let communications = { ...commsSeed }
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener())
}

export function getLeads() {
  return leads
}

export function setLeads(next) {
  leads = next
  emit()
}

export function addLead(lead) {
  setLeads([lead, ...leads])
}

export function updateLead(id, patch) {
  setLeads(leads.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead)))
}

export function removeLead(id) {
  setLeads(leads.filter((lead) => lead.id !== id))
}

export function subscribeLeads(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getCommunications() {
  return communications
}

export function addCommunication(leadId, entry) {
  const existing = communications[leadId] ?? []
  communications = {
    ...communications,
    [leadId]: [...existing, { id: `C-${existing.length + 1}`, ...entry }],
  }
  emit()
}
