import { BarChart3, CalendarHeart, ClipboardCheck, Images, ShieldCheck, Users } from 'lucide-react'

export const authShowcase = {
  Administrator: {
    image: '/images/auth/admin.jpg',
    badge: 'Administrator workspace',
    title: 'Run the studio from one command center.',
    description:
      'Track every lead, event and dollar across Family Affair Key West & Senses At Play — built for owners and operations leads.',
    highlights: [
      {
        icon: BarChart3,
        title: 'Pipeline & revenue at a glance',
        description: 'Monitor leads, bookings and finances across every event.',
      },
      {
        icon: Users,
        title: 'Manage your whole team',
        description: 'Assign tasks, track workloads and keep every department aligned.',
      },
      {
        icon: ShieldCheck,
        title: 'Full control, fully secure',
        description: 'Approve contracts, payments and access across the portal.',
      },
    ],
    stat: {
      value: '120+',
      label: 'weddings, engagements & portrait sessions planned across the Florida Keys',
    },
  },
  'Team Member': {
    image: '/images/auth/team.jpg',
    badge: 'Team workspace',
    title: 'Everything your event day needs, in sync.',
    description:
      'Coordinate vendors, tasks and timelines so every setup runs beautifully, right on schedule.',
    highlights: [
      {
        icon: ClipboardCheck,
        title: 'Your task list, organized',
        description: 'See what’s due today across every event you’re working on.',
      },
      {
        icon: CalendarHeart,
        title: 'Shared event timelines',
        description: 'Stay aligned on setup, run-of-show and vendor schedules.',
      },
      {
        icon: Images,
        title: 'Upload galleries in seconds',
        description: 'Deliver client-ready photos and files without the hassle.',
      },
    ],
    stat: {
      value: '32',
      label: 'active events being coordinated by the team this season',
    },
  },
  Client: {
    image: '/images/auth/client.jpg',
    badge: 'Client portal',
    title: 'Your dream day, beautifully organized.',
    description:
      'From contracts to galleries, follow every detail of your celebration in one place.',
    highlights: [
      {
        icon: CalendarHeart,
        title: 'Your event timeline',
        description: 'Follow every milestone from planning to the big day.',
      },
      {
        icon: ClipboardCheck,
        title: 'Approvals & e-signing',
        description: 'Review proposals and sign contracts — no printing required.',
      },
      {
        icon: Images,
        title: 'Your private gallery',
        description: 'Relive your day with photos shared just for you.',
      },
    ],
    stat: {
      value: '1:1',
      label: 'dedicated planning support from your Family Affair team',
    },
  },
}
