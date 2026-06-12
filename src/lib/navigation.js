import {
  LayoutDashboard,
  Inbox,
  CalendarHeart,
  Briefcase,
  ListChecks,
  FileText,
  Image,
  Receipt,
  GanttChartSquare,
  Users2,
  Settings,
  FolderOpen,
  ClipboardCheck,
} from 'lucide-react'

export const adminNavItems = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard, roles: ['Administrator', 'Team Member'] },
  { title: 'Leads', url: '/admin/leads', icon: Inbox, roles: ['Administrator', 'Team Member'] },
  { title: 'Events', url: '/admin/events', icon: CalendarHeart, roles: ['Administrator', 'Team Member'] },
  { title: 'Vendors', url: '/admin/vendors', icon: Briefcase, roles: ['Administrator', 'Team Member'] },
  { title: 'Tasks', url: '/admin/tasks', icon: ListChecks, roles: ['Administrator', 'Team Member'] },
  { title: 'Documents', url: '/admin/documents', icon: FileText, roles: ['Administrator', 'Team Member'] },
  { title: 'Gallery', url: '/admin/gallery', icon: Image, roles: ['Administrator', 'Team Member'] },
  { title: 'Payments', url: '/admin/payments', icon: Receipt, roles: ['Administrator'] },
  { title: 'Timeline', url: '/admin/timeline', icon: GanttChartSquare, roles: ['Administrator', 'Team Member'] },
  { title: 'Team', url: '/admin/team', icon: Users2, roles: ['Administrator'] },
  { title: 'Settings', url: '/admin/settings', icon: Settings, roles: ['Administrator'] },
]

export const clientNavItems = [
  { title: 'My Event', url: '/client/dashboard', icon: LayoutDashboard },
  { title: 'Timeline', url: '/client/timeline', icon: GanttChartSquare },
  { title: 'Contracts', url: '/client/contracts', icon: FileText },
  { title: 'Documents', url: '/client/documents', icon: FolderOpen },
  { title: 'Invoices', url: '/client/invoices', icon: Receipt },
  { title: 'Gallery', url: '/client/gallery', icon: Image },
  { title: 'Approvals', url: '/client/approvals', icon: ClipboardCheck },
]
