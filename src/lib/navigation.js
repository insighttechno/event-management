import {
  LayoutDashboard,
  Inbox,
  CalendarClock,
  Users,
  Package,
  Signature,
  CreditCard,
  CalendarHeart,
  FileText,
  Images,
  Briefcase,
  ChartColumn,
  Building2,
  UsersRound,
  Settings,
  GanttChartSquare,
  FolderOpen,
  ClipboardCheck,
  ListChecks,
  BookOpen,
  LifeBuoy,
  UserRound,
} from 'lucide-react'

const ALL = ['Administrator', 'Team Member']
const ADMIN = ['Administrator']

// Ordered the way the studio actually works a client's journey — daily work up
// top, setup/admin at the bottom. Familiar tool names are shown on each page,
// not crammed into the sidebar.
export const adminNavItems = [
  // — Everyday workflow —
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard, roles: ALL, section: 'Workspace' },
  { title: 'Leads', url: '/admin/leads', icon: Inbox, roles: ALL, section: 'Workspace' },
  { title: 'Calendar & Meetings', url: '/admin/calendar', icon: CalendarClock, roles: ALL, section: 'Workspace' },
  { title: 'Clients', url: '/admin/clients', icon: Users, roles: ALL, section: 'Workspace' },
  { title: 'Packages', url: '/admin/packages', icon: Package, roles: ALL, section: 'Workspace' },
  { title: 'Contracts', url: '/admin/contracts', icon: Signature, roles: ALL, section: 'Workspace' },
  { title: 'Invoices & Payments', url: '/admin/payments', icon: CreditCard, roles: ADMIN, section: 'Workspace' },
  { title: 'Events', url: '/admin/events', icon: CalendarHeart, roles: ALL, section: 'Workspace' },
  { title: 'Tasks', url: '/admin/tasks', icon: ListChecks, roles: ALL, section: 'Workspace' },
  { title: 'Documents', url: '/admin/documents', icon: FileText, roles: ALL, section: 'Workspace' },
  { title: 'Gallery', url: '/admin/gallery', icon: Images, roles: ALL, section: 'Workspace' },
  { title: 'Vendors', url: '/admin/vendors', icon: Briefcase, roles: ALL, section: 'Workspace' },
  { title: 'Reports', url: '/admin/reports', icon: ChartColumn, roles: ADMIN, section: 'Workspace' },
  // — Setup & administration —
  { title: 'Brands', url: '/admin/brands', icon: Building2, roles: ADMIN, section: 'Setup' },
  { title: 'Team', url: '/admin/team', icon: UsersRound, roles: ADMIN, section: 'Setup' },
  { title: 'Settings', url: '/admin/settings', icon: Settings, roles: ADMIN, section: 'Setup' },
]

export const clientNavItems = [
  // — Overview —
  { title: 'My Event', url: '/client/dashboard', icon: LayoutDashboard, section: 'Overview' },
  { title: 'Onboarding', url: '/client/onboarding', icon: BookOpen, section: 'Overview' },
  { title: 'My Package', url: '/client/package', icon: Package, section: 'Overview' },
  { title: 'Timeline', url: '/client/timeline', icon: GanttChartSquare, section: 'Overview' },
  { title: 'Meetings', url: '/client/meetings', icon: CalendarClock, section: 'Overview' },
  { title: 'Resources', url: '/client/resources', icon: LifeBuoy, section: 'Overview' },
  // — Documents & billing —
  { title: 'Contracts', url: '/client/contracts', icon: FileText, section: 'Documents & billing' },
  { title: 'Invoices', url: '/client/invoices', icon: CreditCard, section: 'Documents & billing' },
  { title: 'Documents', url: '/client/documents', icon: FolderOpen, section: 'Documents & billing' },
  { title: 'Gallery', url: '/client/gallery', icon: Images, section: 'Documents & billing' },
  { title: 'Approvals', url: '/client/approvals', icon: ClipboardCheck, section: 'Documents & billing' },
  // — Account —
  { title: 'Profile', url: '/client/profile', icon: UserRound, section: 'Account' },
  { title: 'Settings', url: '/client/settings', icon: Settings, section: 'Account' },
]
