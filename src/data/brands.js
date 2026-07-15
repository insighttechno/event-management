// The businesses this admin manages. New brands can be added with their own
// identity (logo, colors, domain) and assigned a workflow template.
export const brands = [
  {
    id: 'fa',
    name: 'Family Affair Key West',
    type: 'Weddings & Event Planning',
    domain: 'familyaffairkeywest.com',
    email: 'hello@familyaffairkeywest.com',
    color: '#719f87',
    logo: '/images/brand/family-affair.png',
    workflow: 'Wedding Planning',
    clients: 10,
    status: 'Active',
  },
  {
    id: 'sap',
    name: 'Senses At Play',
    type: 'Photography',
    domain: 'sensesatplay.com',
    email: 'john@sensesatplay.com',
    color: '#c2a15b',
    logo: '/images/brand/senses-at-play.png',
    workflow: 'Photography',
    clients: 8,
    status: 'Active',
  },
]

export const workflowTemplates = ['Wedding Planning', 'Photography', 'Event Coordination', 'Custom (configure)']
