// Vendor data access.
import { vendors, vendorCommunications } from '@/data/vendors'
import { createCollection } from './store'

const collection = createCollection(vendors, 'V')

const communications = { ...vendorCommunications }

export const vendorsService = {
  ...collection,
  communicationsFor(vendorId) {
    return communications[vendorId] ?? []
  },
}
