// Mock identities used to preview the portal as each role (no real auth/backend yet).
export const demoUsers = {
  Administrator: {
    name: 'Bernadette McCall',
    initials: 'BM',
    role: 'Administrator',
    title: 'Operations Director',
    email: 'bernadette@familyaffairkeywest.com',
    company: 'Family Affair Key West',
  },
  'Team Member': {
    name: 'Marco Diaz',
    initials: 'MD',
    role: 'Team Member',
    title: 'Lead Event Planner',
    email: 'marco@familyaffairkeywest.com',
    company: 'Family Affair Key West',
  },
  Client: {
    name: 'Sarah & James Whitfield',
    initials: 'SW',
    role: 'Client',
    title: 'Whitfield Wedding · Nov 14, 2026',
    email: 'sarah.whitfield@example.com',
    company: 'Family Affair Key West',
  },
}

const familyAffairTeam = [
  { id: 'U-1', name: 'Bernadette McCall', initials: 'BM', role: 'Administrator' },
  { id: 'U-2', name: 'Marco Diaz', initials: 'MD', role: 'Team Member' },
  { id: 'U-3', name: 'Natalie Cole', initials: 'NC', role: 'Team Member' },
  { id: 'U-4', name: 'Liam Foster', initials: 'LF', role: 'Team Member' },
  { id: 'U-5', name: 'John McCall', initials: 'JM', role: 'Team Member' },
]

// Seed data for the second demo workspace (Coastal Events Miami).
const coastalTeam = [
  { id: 'U-101', name: 'Carla Mendes', initials: 'CM', role: 'Administrator' },
  { id: 'U-102', name: 'Tom Alvarez', initials: 'TA', role: 'Team Member' },
  { id: 'U-103', name: 'Lucia Romero', initials: 'LR', role: 'Team Member' },
]

export const teamMembers = [
  ...familyAffairTeam.map((member) => ({ ...member, tenantId: 'T-1' })),
  ...coastalTeam.map((member) => ({ ...member, tenantId: 'T-2' })),
]
