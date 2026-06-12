export const vendors = [
  {
    id: 'V-101',
    name: 'Coral Blooms Florals',
    category: 'Florist',
    contact: 'Lena Ortiz',
    phone: '(305) 555-0211',
    email: 'lena@coralblooms.com',
    rating: 4.8,
    eventsCount: 14,
    notes: 'Preferred florist for beach ceremonies, great with tropical arrangements.',
  },
  {
    id: 'V-104',
    name: 'Conch Republic Catering',
    category: 'Catering',
    contact: 'Marcus Lee',
    phone: '(305) 555-0233',
    email: 'marcus@conchrepubliccatering.com',
    rating: 4.6,
    eventsCount: 22,
    notes: 'Reliable for groups over 100, offers vegan/GF menus.',
  },
  {
    id: 'V-110',
    name: 'Island Sounds DJ Co.',
    category: 'Entertainment',
    contact: 'Devon Reid',
    phone: '(305) 555-0245',
    email: 'devon@islandsoundsdj.com',
    rating: 4.9,
    eventsCount: 30,
    notes: 'Top pick for receptions, brings own lighting rig.',
  },
  {
    id: 'V-115',
    name: 'Sunset Cake Studio',
    category: 'Bakery',
    contact: 'Maria Gomez',
    phone: '(305) 555-0256',
    email: 'maria@sunsetcakestudio.com',
    rating: 4.7,
    eventsCount: 18,
    notes: 'Custom tiered cakes, 2-week lead time required.',
  },
  {
    id: 'V-120',
    name: 'Key West Tents & Events',
    category: 'Rentals',
    contact: 'Frank Ibarra',
    phone: '(305) 555-0267',
    email: 'frank@kwtents.com',
    rating: 4.5,
    eventsCount: 26,
    notes: 'Tents, chairs, lighting. Book 60 days out for peak season.',
  },
  {
    id: 'V-126',
    name: 'Salt & Stem Decor',
    category: 'Decor & Styling',
    contact: 'Nadia Brooks',
    phone: '(305) 555-0278',
    email: 'nadia@saltandstem.com',
    rating: 4.9,
    eventsCount: 11,
    notes: 'Specializes in boho and tropical-modern styling.',
  },
]

// Dummy communication log per vendor (no backend yet).
export const vendorCommunications = {
  'V-101': [
    { id: 'C-1', type: 'Email', summary: 'Requested quote for Whitfield arch florals.', date: '2026-05-15', by: 'Marco Diaz' },
    { id: 'C-2', type: 'Call', summary: 'Confirmed orchid availability for November.', date: '2026-06-02', by: 'Marco Diaz' },
  ],
  'V-104': [
    { id: 'C-1', type: 'Email', summary: 'Sent headcount update for Whitfield Wedding.', date: '2026-06-05', by: 'Marco Diaz' },
    { id: 'C-2', type: 'Meeting', summary: 'Tasting session for Bennett Engagement menu.', date: '2026-06-08', by: 'Natalie Cole' },
  ],
  'V-110': [
    { id: 'C-1', type: 'Call', summary: 'Discussed reception playlist preferences.', date: '2026-05-22', by: 'Marco Diaz' },
  ],
  'V-115': [
    { id: 'C-1', type: 'Email', summary: 'Cake design sketches received for Bennett party.', date: '2026-06-01', by: 'Natalie Cole' },
  ],
  'V-120': [],
  'V-126': [
    { id: 'C-1', type: 'Email', summary: 'Shared mood board for Reyes Wedding styling.', date: '2026-05-30', by: 'Bernadette McCall' },
  ],
}

export const vendorCategories = [
  'Florist',
  'Catering',
  'Entertainment',
  'Bakery',
  'Rentals',
  'Decor & Styling',
  'Photography',
  'Transportation',
]
