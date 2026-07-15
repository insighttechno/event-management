// Consultations booked through the portal (native scheduling). Each completed
// session deducts a consultation credit from the client's package.
export const meetings = [
  {
    id: 'MT-01',
    client: 'Sarah & James Whitfield',
    brand: 'Family Affair',
    type: 'Google Meet',
    date: '2026-07-15',
    time: '10:00 AM',
    duration: '1 hour',
    creditType: '1-hour',
    status: 'Scheduled',
  },
  {
    id: 'MT-02',
    client: 'Daniel Brooks',
    brand: 'Family Affair',
    type: 'Phone Call',
    date: '2026-07-16',
    time: '2:30 PM',
    duration: '30 min',
    creditType: '30-min',
    status: 'Scheduled',
  },
  {
    id: 'MT-03',
    client: 'Emily Carter',
    brand: 'Senses At Play',
    type: 'Google Meet',
    date: '2026-07-18',
    time: '9:00 AM',
    duration: '30 min',
    creditType: '30-min',
    status: 'Scheduled',
  },
  {
    id: 'MT-04',
    client: 'Sarah & James Whitfield',
    brand: 'Family Affair',
    type: 'Phone Call',
    date: '2026-07-09',
    time: '11:00 AM',
    duration: '30 min',
    creditType: '30-min',
    status: 'Completed',
  },
]

// Private admin calendar entries — never visible to clients.
export const adminEvents = [
  { id: 'AD-01', title: 'Venue site visit — Casa Marina', date: '2026-07-14', time: '1:00 PM', kind: 'Site visit' },
  { id: 'AD-02', title: 'Team sync', date: '2026-07-15', time: '4:00 PM', kind: 'Internal' },
  { id: 'AD-03', title: 'Vendor tasting — florals', date: '2026-07-17', time: '11:30 AM', kind: 'Vendor' },
]

export const meetingTypes = ['Phone Call', 'Google Meet']
