const familyAffairTasks = [
  {
    id: 'T-501',
    title: 'Confirm catering headcount with Conch Republic',
    event: 'Whitfield Wedding',
    assignedTo: 'Marco Diaz',
    dueDate: '2026-06-20',
    status: 'In Progress',
    priority: 'High',
  },
  {
    id: 'T-502',
    title: 'Send updated proposal to Hayes family',
    event: 'Hayes Wedding (Lead)',
    assignedTo: 'Natalie Cole',
    dueDate: '2026-06-15',
    status: 'To Do',
    priority: 'High',
  },
  {
    id: 'T-503',
    title: 'Order tropical centerpiece samples',
    event: 'Reyes Wedding',
    assignedTo: 'Bernadette McCall',
    dueDate: '2026-06-25',
    status: 'To Do',
    priority: 'Medium',
  },
  {
    id: 'T-504',
    title: 'Finalize ceremony script with officiant',
    event: 'Brooks Vow Renewal',
    assignedTo: 'Marco Diaz',
    dueDate: '2026-06-30',
    status: 'In Progress',
    priority: 'Medium',
  },
  {
    id: 'T-505',
    title: 'Edit and upload Carter engagement gallery',
    event: 'Carter Engagement Shoot',
    assignedTo: 'John McCall',
    dueDate: '2026-08-01',
    status: 'To Do',
    priority: 'Low',
  },
  {
    id: 'T-506',
    title: 'Confirm tent rental for Bennett party',
    event: 'Bennett Engagement Party',
    assignedTo: 'Natalie Cole',
    dueDate: '2026-06-18',
    status: 'Done',
    priority: 'Medium',
  },
  {
    id: 'T-507',
    title: 'Collect signed contract from Reyes family',
    event: 'Reyes Wedding',
    assignedTo: 'Bernadette McCall',
    dueDate: '2026-06-22',
    status: 'In Progress',
    priority: 'High',
  },
  {
    id: 'T-508',
    title: 'Schedule final walkthrough at Smathers Beach',
    event: 'Whitfield Wedding',
    assignedTo: 'Marco Diaz',
    dueDate: '2026-08-20',
    status: 'To Do',
    priority: 'Medium',
  },
]

// Seed data for the second demo workspace (Coastal Events Miami).
const coastalTasks = [
  {
    id: 'T-601',
    title: 'Shortlist three live bands for Fuentes reception',
    event: 'Fuentes Wedding',
    assignedTo: 'Carla Mendes',
    dueDate: '2026-06-19',
    status: 'In Progress',
    priority: 'High',
  },
  {
    id: 'T-602',
    title: 'Send Shah contract for review',
    event: 'Shah Sangeet Weekend',
    assignedTo: 'Tom Alvarez',
    dueDate: '2026-06-17',
    status: 'To Do',
    priority: 'High',
  },
  {
    id: 'T-603',
    title: 'Book Vizcaya site visit with décor team',
    event: 'Shah Sangeet Weekend',
    assignedTo: 'Carla Mendes',
    dueDate: '2026-07-02',
    status: 'To Do',
    priority: 'Medium',
  },
]

export const tasks = [
  ...familyAffairTasks.map((task) => ({ ...task, tenantId: 'T-1' })),
  ...coastalTasks.map((task) => ({ ...task, tenantId: 'T-2' })),
]

export const taskStatuses = ['To Do', 'In Progress', 'Done']
