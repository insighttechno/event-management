// The lead → client journey. Each stage has a clear "next action" so the flow
// is obvious inside the portal. Shared by the Leads list and the lead detail
// page.
export const FLOW = [
  { stage: 'New Inquiry', short: 'Inquiry', action: 'Send initial email', next: 'Contacted',
    help: 'Welcome email with the Calendly booking link.', toast: (l) => `Initial email with Calendly link sent to ${l.name}. Moved to Contacted.` },
  { stage: 'Contacted', short: 'Contacted', action: 'Mark consultation booked', next: 'Consultation Scheduled',
    help: 'Client booked a call via Calendly.', toast: (l) => `Consultation booked with ${l.name}.` },
  { stage: 'Consultation Scheduled', short: 'Consultation', action: 'Send intake form', next: 'Proposal Sent',
    help: 'Client fills the intake form once — it auto-fills their profile, event details & contract.', toast: (l) => `Intake form link sent to ${l.name}. Their answers auto-populate the system.` },
  { stage: 'Proposal Sent', short: 'Proposal', action: 'Generate & send contract', next: 'Awaiting Approval',
    help: 'AI-drafts the contract from the intake form, then sends via Adobe Acrobat Sign.', toast: (l) => `Contract sent to ${l.name} for e-signature.` },
  { stage: 'Awaiting Approval', short: 'Deposit', action: 'Record deposit paid', next: 'Booked',
    help: 'Contract signed + deposit received.', toast: (l) => `Deposit recorded — ${l.name} is booked!` },
  { stage: 'Booked', short: 'Client', action: 'Convert to client', next: null,
    help: 'Create the client profile, assign the package and send portal login.', toast: (l) => `${l.name} converted to a client — portal access created.` },
]

export function followUpStatus(lead) {
  if (!lead.nextFollowUp) return null
  const today = new Date().toISOString().slice(0, 10)
  if (lead.nextFollowUp < today) return 'overdue'
  if (lead.nextFollowUp === today) return 'today'
  return 'upcoming'
}

// A lead created within the last 7 days shows as "New".
export function isNewLead(lead) {
  if (!lead.createdAt) return false
  return (Date.now() - new Date(lead.createdAt)) / 86400000 <= 7
}
