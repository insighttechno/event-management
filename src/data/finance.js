const familyAffairInvoices = [
  {
    id: 'INV-3001',
    client: 'Sarah & James Whitfield',
    event: 'Whitfield Wedding',
    amount: 42000,
    paid: 21000,
    dueDate: '2026-09-01',
    status: 'Partially Paid',
  },
  {
    id: 'INV-3004',
    client: 'Olivia & Mark Reyes',
    event: 'Reyes Wedding',
    amount: 51000,
    paid: 0,
    dueDate: '2026-07-15',
    status: 'Awaiting Payment',
  },
  {
    id: 'INV-3007',
    client: 'Daniel Brooks',
    event: 'Brooks Vow Renewal',
    amount: 9500,
    paid: 9500,
    dueDate: '2026-06-01',
    status: 'Paid',
  },
  {
    id: 'INV-3010',
    client: 'Sophie Bennett',
    event: 'Bennett Engagement Party',
    amount: 18000,
    paid: 18000,
    dueDate: '2026-06-10',
    status: 'Paid',
  },
  {
    id: 'INV-3012',
    client: 'Emily Carter',
    event: 'Carter Engagement Shoot',
    amount: 1200,
    paid: 600,
    dueDate: '2026-07-10',
    status: 'Partially Paid',
  },
]

// Seed data for the second demo workspace (Coastal Events Miami).
const coastalInvoices = [
  {
    id: 'INV-4001',
    client: 'Isabella & Diego Fuentes',
    event: 'Fuentes Wedding',
    amount: 64000,
    paid: 32000,
    dueDate: '2026-09-01',
    status: 'Partially Paid',
  },
  {
    id: 'INV-4002',
    client: 'Priya & Arjun Shah',
    event: 'Shah Sangeet Weekend',
    amount: 88000,
    paid: 0,
    dueDate: '2026-07-20',
    status: 'Awaiting Payment',
  },
]

export const invoices = [
  ...familyAffairInvoices.map((invoice) => ({ ...invoice, tenantId: 'T-1' })),
  ...coastalInvoices.map((invoice) => ({ ...invoice, tenantId: 'T-2' })),
]

// Monthly revenue per workspace (tenant id → series).
export const monthlyRevenueByTenant = {
  'T-1': [
    { month: 'Jan', revenue: 18500 },
    { month: 'Feb', revenue: 24200 },
    { month: 'Mar', revenue: 31000 },
    { month: 'Apr', revenue: 27800 },
    { month: 'May', revenue: 35600 },
    { month: 'Jun', revenue: 42100 },
  ],
  'T-2': [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 9500 },
    { month: 'Apr', revenue: 21000 },
    { month: 'May', revenue: 28400 },
    { month: 'Jun', revenue: 36800 },
  ],
}

const familyAffairContracts = [
  {
    id: 'C-9001',
    title: 'Wedding Planning Agreement',
    client: 'Sarah & James Whitfield',
    event: 'Whitfield Wedding',
    status: 'Signed',
    sentDate: '2026-01-20',
    signedDate: '2026-01-25',
  },
  {
    id: 'C-9004',
    title: 'Full Service Wedding Contract',
    client: 'Olivia & Mark Reyes',
    event: 'Reyes Wedding',
    status: 'Awaiting Signature',
    sentDate: '2026-06-01',
    signedDate: null,
  },
  {
    id: 'C-9007',
    title: 'Vow Renewal Agreement',
    client: 'Daniel Brooks',
    event: 'Brooks Vow Renewal',
    status: 'Signed',
    sentDate: '2026-04-15',
    signedDate: '2026-04-18',
  },
]

const coastalContracts = [
  {
    id: 'C-9101',
    title: 'Luxury Wedding Package Contract',
    client: 'Isabella & Diego Fuentes',
    event: 'Fuentes Wedding',
    status: 'Signed',
    sentDate: '2026-04-28',
    signedDate: '2026-05-02',
  },
  {
    id: 'C-9102',
    title: 'Luxury Wedding Package Contract',
    client: 'Priya & Arjun Shah',
    event: 'Shah Sangeet Weekend',
    status: 'Awaiting Signature',
    sentDate: '2026-06-05',
    signedDate: null,
  },
]

export const contracts = [
  ...familyAffairContracts.map((contract) => ({ ...contract, tenantId: 'T-1' })),
  ...coastalContracts.map((contract) => ({ ...contract, tenantId: 'T-2' })),
]

const familyAffairGalleries = [
  {
    id: 'G-701',
    title: 'Whitfield Engagement Session',
    client: 'Sarah & James Whitfield',
    photographer: 'John McCall',
    photoCount: 142,
    status: 'Delivered',
    deliveredDate: '2026-04-02',
  },
  {
    id: 'G-705',
    title: 'Carter Engagement Shoot',
    client: 'Emily Carter',
    photographer: 'John McCall',
    photoCount: 0,
    status: 'In Progress',
    deliveredDate: null,
  },
  {
    id: 'G-708',
    title: 'Bennett Engagement Party',
    client: 'Sophie Bennett',
    photographer: 'John McCall',
    photoCount: 210,
    status: 'Editing',
    deliveredDate: null,
  },
]

const coastalGalleries = [
  {
    id: 'G-801',
    title: 'Fuentes Engagement Session',
    client: 'Isabella & Diego Fuentes',
    photographer: 'Lucia Romero',
    photoCount: 96,
    status: 'Editing',
    deliveredDate: null,
  },
]

export const galleries = [
  ...familyAffairGalleries.map((gallery) => ({ ...gallery, tenantId: 'T-1' })),
  ...coastalGalleries.map((gallery) => ({ ...gallery, tenantId: 'T-2' })),
]

const familyAffairApprovals = [
  {
    id: 'A-1',
    type: 'Contract',
    title: 'Wedding Planning Agreement - Final Draft',
    status: 'Approved',
    date: '2026-01-25',
  },
  {
    id: 'A-2',
    type: 'Timeline',
    title: 'Updated Ceremony & Reception Timeline',
    status: 'Pending',
    date: '2026-06-08',
  },
  {
    id: 'A-3',
    type: 'Document',
    title: 'Floor Plan v3 - Smathers Beach Layout',
    status: 'Pending',
    date: '2026-06-09',
  },
  {
    id: 'A-4',
    type: 'Gallery',
    title: 'Engagement Session Gallery Release',
    status: 'Approved',
    date: '2026-04-02',
  },
]

const coastalApprovals = [
  {
    id: 'A-101',
    type: 'Contract',
    title: 'Luxury Wedding Package - Fuentes',
    status: 'Approved',
    date: '2026-05-02',
  },
  {
    id: 'A-102',
    type: 'Timeline',
    title: 'Reception Timeline Draft v2',
    status: 'Pending',
    date: '2026-06-07',
  },
]

export const approvals = [
  ...familyAffairApprovals.map((approval) => ({ ...approval, tenantId: 'T-1' })),
  ...coastalApprovals.map((approval) => ({ ...approval, tenantId: 'T-2' })),
]
