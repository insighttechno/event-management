export const events = [
  {
    id: 'E-2031',
    name: 'Whitfield Wedding',
    client: 'Sarah & James Whitfield',
    type: 'Wedding',
    date: '2026-11-14',
    venue: 'Smathers Beach, Key West',
    status: 'Planning',
    guestCount: 80,
    budget: 42000,
    planner: 'Marco Diaz',
    milestones: [
      { title: 'Venue booked', date: '2026-02-01', done: true },
      { title: 'Catering finalized', date: '2026-06-15', done: true },
      { title: 'Décor walkthrough', date: '2026-08-20', done: false },
      { title: 'Final headcount due', date: '2026-10-25', done: false },
      { title: 'Wedding day', date: '2026-11-14', done: false },
    ],
  },
  {
    id: 'E-2034',
    name: 'Reyes Wedding',
    client: 'Olivia & Mark Reyes',
    type: 'Wedding',
    date: '2027-03-20',
    venue: 'Fort Zachary Taylor',
    status: 'Awaiting Contract',
    guestCount: 110,
    budget: 51000,
    planner: 'Bernadette McCall',
    milestones: [
      { title: 'Contract signed', date: '2026-07-01', done: false },
      { title: 'Vendor selection', date: '2026-09-01', done: false },
      { title: 'Wedding day', date: '2027-03-20', done: false },
    ],
  },
  {
    id: 'E-2027',
    name: 'Brooks Vow Renewal',
    client: 'Daniel Brooks',
    type: 'Vow Renewal',
    date: '2026-08-09',
    venue: 'Sunset Pier, Mallory Square',
    status: 'Confirmed',
    guestCount: 25,
    budget: 9500,
    planner: 'Marco Diaz',
    milestones: [
      { title: 'Ceremony script approved', date: '2026-06-30', done: false },
      { title: 'Florals confirmed', date: '2026-07-20', done: false },
      { title: 'Ceremony day', date: '2026-08-09', done: false },
    ],
  },
  {
    id: 'E-2019',
    name: 'Bennett Engagement Party',
    client: 'Sophie Bennett',
    type: 'Engagement',
    date: '2026-07-04',
    venue: 'Casa Marina Resort',
    status: 'Confirmed',
    guestCount: 60,
    budget: 18000,
    planner: 'Natalie Cole',
    milestones: [
      { title: 'Catering tasting', date: '2026-06-15', done: true },
      { title: 'Final guest list', date: '2026-06-25', done: false },
      { title: 'Event day', date: '2026-07-04', done: false },
    ],
  },
  {
    id: 'E-2008',
    name: 'Carter Engagement Shoot',
    client: 'Emily Carter',
    type: 'Photography',
    date: '2026-07-18',
    venue: 'Higgs Beach',
    status: 'Planning',
    guestCount: 2,
    budget: 1200,
    planner: 'John McCall',
    milestones: [
      { title: 'Shoot location confirmed', date: '2026-06-12', done: true },
      { title: 'Shoot day', date: '2026-07-18', done: false },
      { title: 'Gallery delivery', date: '2026-08-01', done: false },
    ],
  },
]

// Dummy vendor assignments per event (vendor ids from data/vendors.js).
export const eventVendorAssignments = {
  'E-2031': ['V-101', 'V-104', 'V-110'],
  'E-2034': ['V-126'],
  'E-2027': ['V-101'],
  'E-2019': ['V-104', 'V-115'],
  'E-2008': [],
}

// Dummy notes per event.
export const eventNotes = {
  'E-2031': [
    { id: 'N-1', text: 'Bride prefers white orchids over roses for the arch.', by: 'Marco Diaz', date: '2026-05-12' },
    { id: 'N-2', text: 'Beach permit confirmed with the city for Nov 14.', by: 'Bernadette McCall', date: '2026-05-28' },
  ],
  'E-2034': [
    { id: 'N-1', text: 'Clients comparing our décor package with a Miami vendor.', by: 'Bernadette McCall', date: '2026-05-20' },
  ],
  'E-2027': [
    { id: 'N-1', text: 'Couple wants original vows read by their daughter.', by: 'Marco Diaz', date: '2026-06-01' },
  ],
  'E-2019': [],
  'E-2008': [],
}

export const eventStatuses = [
  'Planning',
  'Awaiting Contract',
  'Confirmed',
  'In Progress',
  'Completed',
  'Cancelled',
]
