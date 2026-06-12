export const documentFolders = ['Contracts', 'Invoices', 'Floor Plans', 'Inspiration', 'Permits']

const familyAffairTemplates = [
  {
    id: 'CT-1',
    name: 'Full Service Wedding Contract',
    description: 'Complete planning, vendor management and day-of coordination.',
    updatedAt: '2026-03-12',
  },
  {
    id: 'CT-2',
    name: 'Partial Planning Agreement',
    description: 'Month-of coordination with limited vendor management.',
    updatedAt: '2026-02-04',
  },
  {
    id: 'CT-3',
    name: 'Photography Services Contract',
    description: 'Senses At Play shoots — sessions, editing and gallery delivery.',
    updatedAt: '2026-04-20',
  },
  {
    id: 'CT-4',
    name: 'Vow Renewal Agreement',
    description: 'Intimate ceremonies and vow renewal packages.',
    updatedAt: '2026-01-15',
  },
]

const coastalTemplates = [
  {
    id: 'CT-5',
    name: 'Luxury Wedding Package Contract',
    description: 'Full-service planning for 100+ guest celebrations.',
    updatedAt: '2026-04-02',
  },
  {
    id: 'CT-6',
    name: 'Corporate Event Agreement',
    description: 'Offsites, galas and company celebrations.',
    updatedAt: '2026-05-11',
  },
]

export const contractTemplates = [
  ...familyAffairTemplates.map((template) => ({ ...template, tenantId: 'T-1' })),
  ...coastalTemplates.map((template) => ({ ...template, tenantId: 'T-2' })),
]

const familyAffairDocuments = [
  {
    id: 'D-501',
    name: 'Wedding Planning Agreement.pdf',
    folder: 'Contracts',
    client: 'Sarah & James Whitfield',
    size: '420 KB',
    uploadedAt: '2026-01-20',
    sharedWithClient: true,
  },
  {
    id: 'D-502',
    name: 'Smathers Beach Floor Plan v3.pdf',
    folder: 'Floor Plans',
    client: 'Sarah & James Whitfield',
    size: '1.2 MB',
    uploadedAt: '2026-06-09',
    sharedWithClient: true,
  },
  {
    id: 'D-503',
    name: 'Beach Ceremony Permit 2026.pdf',
    folder: 'Permits',
    client: 'Sarah & James Whitfield',
    size: '180 KB',
    uploadedAt: '2026-05-28',
    sharedWithClient: false,
  },
  {
    id: 'D-504',
    name: 'Reyes Full Service Contract.pdf',
    folder: 'Contracts',
    client: 'Olivia & Mark Reyes',
    size: '410 KB',
    uploadedAt: '2026-06-01',
    sharedWithClient: true,
  },
  {
    id: 'D-505',
    name: 'Tropical Décor Mood Board.png',
    folder: 'Inspiration',
    client: 'Olivia & Mark Reyes',
    size: '3.4 MB',
    uploadedAt: '2026-05-30',
    sharedWithClient: false,
  },
  {
    id: 'D-506',
    name: 'Invoice INV-3001 Deposit.pdf',
    folder: 'Invoices',
    client: 'Sarah & James Whitfield',
    size: '95 KB',
    uploadedAt: '2026-02-01',
    sharedWithClient: true,
  },
]

// Seed data for the second demo workspace (Coastal Events Miami).
const coastalDocuments = [
  {
    id: 'D-601',
    name: 'Fuentes Wedding Agreement.pdf',
    folder: 'Contracts',
    client: 'Isabella & Diego Fuentes',
    size: '380 KB',
    uploadedAt: '2026-05-02',
    sharedWithClient: true,
  },
  {
    id: 'D-602',
    name: 'Surfcomber Ballroom Layout.pdf',
    folder: 'Floor Plans',
    client: 'Isabella & Diego Fuentes',
    size: '1.6 MB',
    uploadedAt: '2026-06-01',
    sharedWithClient: false,
  },
]

export const documents = [
  ...familyAffairDocuments.map((doc) => ({ ...doc, tenantId: 'T-1' })),
  ...coastalDocuments.map((doc) => ({ ...doc, tenantId: 'T-2' })),
]
