export const invoices = [
  { id: 'INV-3001', client: 'Sarah & James Whitfield', brand: 'Family Affair', event: 'Whitfield Wedding', amount: 42000, deposit: 1000, paid: 21000, dueDate: '2026-09-01', status: 'Partially Paid' },
  { id: 'INV-3004', client: 'Olivia & Mark Reyes', brand: 'Family Affair', event: 'Reyes Wedding', amount: 51000, deposit: 1000, paid: 0, dueDate: '2026-07-05', status: 'Awaiting Payment' },
  { id: 'INV-3007', client: 'Daniel Brooks', brand: 'Family Affair', event: 'Brooks Vow Renewal', amount: 9500, deposit: 1000, paid: 9500, dueDate: '2026-06-01', status: 'Paid' },
  { id: 'INV-3010', client: 'Sophie Bennett', brand: 'Family Affair', event: 'Bennett Engagement Party', amount: 18000, deposit: 1000, paid: 18000, dueDate: '2026-06-10', status: 'Paid' },
  { id: 'INV-3012', client: 'Emily Carter', brand: 'Senses At Play', event: 'Carter Engagement Shoot', amount: 1200, deposit: 500, paid: 1200, dueDate: '2026-06-20', status: 'Paid' },
]

// Accepted payment methods shown in the invoice bundle (from the client's process).
export const paymentMethods = [
  { method: 'Electronic check', detail: 'No convenience fee' },
  { method: 'Zelle', detail: 'john@sensesatplay.com' },
  { method: 'Venmo', detail: '@Bernadette-McCall' },
  { method: 'Mailed check', detail: '9 Aster Terrace, Key West, FL 33040' },
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
  {
    id: 'C-9012',
    title: 'Photography Services Agreement',
    client: 'Emily Carter',
    event: 'Carter Engagement Shoot',
    status: 'Signed',
    sentDate: '2026-06-05',
    signedDate: '2026-06-08',
  },
]

export const galleries = [
  {
    id: 'G-701',
    title: 'Whitfield Engagement Session',
    client: 'Sarah & James Whitfield',
    photographer: 'John McCall',
    cover: '/images/gallery/g1.jpg',
    photoCount: 142,
    videoCount: 3,
    status: 'Delivered',
    deliveredDate: '2026-04-02',
  },
  {
    id: 'G-705',
    title: 'Carter Engagement Shoot',
    client: 'Emily Carter',
    photographer: 'John McCall',
    cover: '/images/gallery/g2.jpg',
    photoCount: 96,
    videoCount: 3,
    status: 'Delivered',
    deliveredDate: '2026-07-05',
  },
  {
    id: 'G-708',
    title: 'Bennett Engagement Party',
    client: 'Sophie Bennett',
    photographer: 'John McCall',
    cover: '/images/gallery/g3.jpg',
    photoCount: 210,
    videoCount: 5,
    status: 'Editing',
    deliveredDate: null,
  },
]

export const approvals = [
  {
    id: 'A-1',
    client: 'Sarah & James Whitfield',
    type: 'Contract',
    title: 'Wedding Planning Agreement - Final Draft',
    status: 'Approved',
    date: '2026-01-25',
  },
  {
    id: 'A-2',
    client: 'Sarah & James Whitfield',
    type: 'Timeline',
    title: 'Updated Ceremony & Reception Timeline',
    status: 'Pending',
    date: '2026-06-08',
  },
  {
    id: 'A-3',
    client: 'Sarah & James Whitfield',
    type: 'Document',
    title: 'Floor Plan v3 - Smathers Beach Layout',
    status: 'Pending',
    date: '2026-06-09',
  },
  {
    id: 'A-4',
    client: 'Emily Carter',
    type: 'Gallery',
    title: 'Engagement Session Gallery Release',
    status: 'Approved',
    date: '2026-07-04',
  },
  {
    id: 'A-5',
    client: 'Emily Carter',
    type: 'Gallery',
    title: 'Print & Album Selection',
    status: 'Pending',
    date: '2026-07-06',
  },
]
