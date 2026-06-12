const familyAffairNotifications = [
  {
    id: 'N-101',
    title: 'New lead assigned',
    description: 'Hayes Wedding lead was assigned to Natalie Cole.',
    time: '5 min ago',
    read: false,
  },
  {
    id: 'N-102',
    title: 'Payment received',
    description: 'Whitfield Wedding — invoice INV-2043 paid in full.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 'N-103',
    title: 'Task due today',
    description: 'Send updated proposal to Hayes family is due today.',
    time: '3 hours ago',
    read: false,
  },
  {
    id: 'N-104',
    title: 'Vendor confirmed',
    description: 'Conch Republic Catering confirmed for June 20.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'N-105',
    title: 'Contract signed',
    description: 'Reyes Wedding contract was signed by the client.',
    time: '2 days ago',
    read: true,
  },
]

// Seed data for the second demo workspace (Coastal Events Miami).
const coastalNotifications = [
  {
    id: 'N-201',
    title: 'New corporate inquiry',
    description: 'Marriott Quarterly Offsite lead was created.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'N-202',
    title: 'Payment received',
    description: 'Fuentes Wedding — 50% deposit received on INV-4001.',
    time: 'Yesterday',
    read: false,
  },
]

export const notifications = [
  ...familyAffairNotifications.map((item) => ({ ...item, tenantId: 'T-1' })),
  ...coastalNotifications.map((item) => ({ ...item, tenantId: 'T-2' })),
]
