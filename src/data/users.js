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

export const teamMembers = [
  { id: 'U-1', name: 'Bernadette McCall', initials: 'BM', role: 'Administrator' },
  { id: 'U-2', name: 'Marco Diaz', initials: 'MD', role: 'Team Member' },
  { id: 'U-3', name: 'Natalie Cole', initials: 'NC', role: 'Team Member' },
  { id: 'U-4', name: 'Liam Foster', initials: 'LF', role: 'Team Member' },
  { id: 'U-5', name: 'John McCall', initials: 'JM', role: 'Team Member' },
]
