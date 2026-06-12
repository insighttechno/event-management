export const invoices = [
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

export const monthlyRevenue = [
  { month: 'Jan', revenue: 18500 },
  { month: 'Feb', revenue: 24200 },
  { month: 'Mar', revenue: 31000 },
  { month: 'Apr', revenue: 27800 },
  { month: 'May', revenue: 35600 },
  { month: 'Jun', revenue: 42100 },
]

export const contracts = [
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

export const galleries = [
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

export const approvals = [
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
