// Lead & inquiry data access. Replace bodies with API calls when backend exists.
import { leads, leadCommunications } from '@/data/leads'
import { createCollection } from './store'

const collection = createCollection(leads, 'L')

// Communication log keyed by lead id (tenant-safe: lead ids are tenant-scoped).
let communications = { ...leadCommunications }

export const leadsService = {
  ...collection,
  communicationsFor(leadId) {
    return communications[leadId] ?? []
  },
  addCommunication(leadId, entry) {
    const existing = communications[leadId] ?? []
    communications = {
      ...communications,
      [leadId]: [...existing, { ...entry, id: `C-${existing.length + 1}` }],
    }
    return communications[leadId]
  },
}
