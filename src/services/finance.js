// Invoices, contracts, galleries, approvals and revenue data access.
import {
  invoices,
  contracts,
  galleries,
  approvals,
  monthlyRevenueByTenant,
} from '@/data/finance'
import { createCollection } from './store'
import { getCurrentTenantId } from './tenant-store'

export const invoicesService = createCollection(invoices, 'INV')
export const contractsService = createCollection(contracts, 'C')
export const galleriesService = createCollection(galleries, 'G')
export const approvalsService = createCollection(approvals, 'A')

const emptyRevenue = [
  { month: 'Jan', revenue: 0 },
  { month: 'Feb', revenue: 0 },
  { month: 'Mar', revenue: 0 },
  { month: 'Apr', revenue: 0 },
  { month: 'May', revenue: 0 },
  { month: 'Jun', revenue: 0 },
]

export const revenueService = {
  monthly() {
    return monthlyRevenueByTenant[getCurrentTenantId()] ?? emptyRevenue
  },
}
