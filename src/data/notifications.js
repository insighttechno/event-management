// Each notification carries a `type` (category) that drives a coloured badge so
// you can tell at a glance what — and who — the notification is for. Every badge
// has a clear background colour (works in light & dark).
export const notificationTypes = {
  Lead: { label: 'New Lead', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  Payment: { label: 'Payment', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  Task: { label: 'Task', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  Vendor: { label: 'Vendor', className: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
  Contract: { label: 'Contract', className: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' },
  Meeting: { label: 'Meeting', className: 'bg-teal-500/15 text-teal-600 dark:text-teal-400' },
  Gallery: { label: 'Gallery', className: 'bg-pink-500/15 text-pink-600 dark:text-pink-400' },
  Approval: { label: 'Approval', className: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  Message: { label: 'Message', className: 'bg-sky-500/15 text-sky-600 dark:text-sky-400' },
  Onboarding: { label: 'Onboarding', className: 'bg-primary/15 text-primary' },
}

// Fallback badge style for any unknown type.
export const defaultNotificationType = { label: 'Update', className: 'bg-muted text-muted-foreground' }

// —— Admin notifications (business-wide) ——
export const adminNotifications = [
  { id: 'N-101', type: 'Lead', title: 'New lead assigned', description: 'Hayes Wedding lead was assigned to Natalie Cole.', time: '5 min ago', read: false },
  { id: 'N-102', type: 'Payment', title: 'Payment received', description: 'Whitfield Wedding — invoice INV-2043 paid in full.', time: '1 hour ago', read: false },
  { id: 'N-103', type: 'Task', title: 'Task due today', description: 'Send updated proposal to Hayes family is due today.', time: '3 hours ago', read: false },
  { id: 'N-104', type: 'Vendor', title: 'Vendor confirmed', description: 'Conch Republic Catering confirmed for June 20.', time: 'Yesterday', read: true },
  { id: 'N-105', type: 'Contract', title: 'Contract signed', description: 'Reyes Wedding contract was signed by the client.', time: '2 days ago', read: true },
]

// Kept for backwards compatibility (previous default export name).
export const notifications = adminNotifications

// —— Client notifications (brand-aware, per the logged-in client) ——
export function getClientNotifications(cfg, event) {
  const name = event?.name ?? 'your event'
  if (cfg?.kind === 'gallery') {
    return [
      { id: 'CN-01', type: 'Gallery', title: 'Your gallery is ready', description: `${name} — 96 photos & 3 films are ready to view and download.`, time: '2 days ago', read: false },
      { id: 'CN-02', type: 'Approval', title: 'Action needed: print selection', description: 'Choose your favourites for prints & album.', time: '1 day ago', read: false },
      { id: 'CN-03', type: 'Payment', title: 'Payment received', description: 'Your session invoice is paid in full — thank you!', time: '3 days ago', read: true },
      { id: 'CN-04', type: 'Meeting', title: 'Consultation scheduled', description: 'Your 30-minute call is booked for Jul 18.', time: '4 days ago', read: true },
    ]
  }
  return [
    { id: 'CN-01', type: 'Approval', title: 'Action needed: timeline review', description: 'Please review your updated ceremony & reception timeline.', time: '3 hours ago', read: false },
    { id: 'CN-02', type: 'Meeting', title: 'Consultation scheduled', description: 'Your 1-hour planning call is booked for Jul 15.', time: '1 day ago', read: false },
    { id: 'CN-03', type: 'Message', title: 'Message from your planner', description: 'Marco shared a few florist options for you to look at.', time: '5 hours ago', read: false },
    { id: 'CN-04', type: 'Payment', title: 'Payment received', description: `Deposit received for ${name}.`, time: '2 days ago', read: true },
    { id: 'CN-05', type: 'Contract', title: 'Contract signed', description: 'Your planning agreement is fully executed.', time: '1 week ago', read: true },
  ]
}
