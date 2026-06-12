import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  ClipboardCheck,
  Circle,
  CreditCard,
  FileText,
  FolderOpen,
  GanttChartSquare,
  Image,
  MapPin,
  PenLine,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { events } from '@/data/events'
import { contracts, invoices, galleries, approvals } from '@/data/finance'
import { formatCurrency, formatDate } from '@/lib/utils'

function daysUntil(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil((new Date(date) - today) / 86400000))
}

const quickLinks = [
  {
    title: 'Timeline',
    description: 'Milestones & day-of schedule',
    url: '/client/timeline',
    icon: GanttChartSquare,
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Contracts',
    description: 'Review & sign documents',
    url: '/client/contracts',
    icon: FileText,
    color: 'bg-secondary/10 text-secondary',
  },
  {
    title: 'Documents',
    description: 'Files shared with you',
    url: '/client/documents',
    icon: FolderOpen,
    color: 'bg-accent/20 text-accent-foreground',
  },
  {
    title: 'Invoices',
    description: 'Balances & payments',
    url: '/client/invoices',
    icon: CreditCard,
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Gallery',
    description: 'Your photos & sessions',
    url: '/client/gallery',
    icon: Image,
    color: 'bg-secondary/10 text-secondary',
  },
  {
    title: 'Approvals',
    description: 'Items awaiting your review',
    url: '/client/approvals',
    icon: ClipboardCheck,
    color: 'bg-accent/20 text-accent-foreground',
  },
]

export default function ClientDashboard() {
  const { user } = useAuth()
  const event = events[0]
  const days = daysUntil(event.date)
  const completed = event.milestones.filter((m) => m.done).length
  const progress = event.milestones.length
    ? Math.round((completed / event.milestones.length) * 100)
    : 0
  const firstName = user?.name?.split(/[\s&]+/)[0] ?? 'there'

  const myContract = contracts.find((c) => c.event === event.name)
  const myInvoice = invoices.find((i) => i.event === event.name)
  const myGallery = galleries.find((g) => g.client === event.client)
  const pendingApprovals = approvals.filter((a) => a.status === 'Pending')
  const balanceDue = (myInvoice?.amount ?? 0) - (myInvoice?.paid ?? 0)
  const nextMilestone = event.milestones.find((m) => !m.done)

  const attentionItems = [
    ...(myContract?.status === 'Awaiting Signature'
      ? [
          {
            id: 'contract',
            icon: PenLine,
            title: 'Your contract is ready to sign',
            description: myContract.title,
            cta: 'Sign now',
            url: '/client/contracts',
          },
        ]
      : []),
    ...pendingApprovals.map((item) => ({
      id: item.id,
      icon: ClipboardCheck,
      title: `Approval needed: ${item.type}`,
      description: item.title,
      cta: 'Review',
      url: '/client/approvals',
    })),
    ...(balanceDue > 0
      ? [
          {
            id: 'balance',
            icon: CreditCard,
            title: `Balance due: ${formatCurrency(balanceDue)}`,
            description: `Next payment due ${formatDate(myInvoice.dueDate)}`,
            cta: 'Pay now',
            url: '/client/invoices',
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.32_0.05_220)] via-[oklch(0.38_0.06_230)] to-[oklch(0.48_0.07_160)] p-6 text-white shadow-lg lg:p-8">
        <div className="absolute -top-16 -right-16 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-24 size-40 rounded-full bg-accent/30 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-white/70">
              <Sparkles className="size-4" />
              Welcome back, {firstName}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold lg:text-4xl">
              {event.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <CalendarHeart className="size-4" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {event.venue}
              </span>
            </div>
            <div className="mt-5 max-w-sm">
              <div className="mb-1.5 flex items-center justify-between text-xs text-white/70">
                <span>Planning progress</span>
                <span className="font-semibold text-white">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {nextMilestone && (
                <p className="mt-2 text-xs text-white/70">
                  Up next: <span className="text-white">{nextMilestone.title}</span> ·{' '}
                  {formatDate(nextMilestone.date)}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-center">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-8 py-6 text-center backdrop-blur-md">
              <p className="font-display text-5xl font-bold lg:text-6xl">{days}</p>
              <p className="mt-1 text-xs font-medium tracking-widest text-white/70 uppercase">
                days to go
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Needs your attention */}
      {attentionItems.length > 0 && (
        <Card className="border-accent/50 bg-gradient-to-br from-accent/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-base">Needs your attention</CardTitle>
            <CardDescription>
              {attentionItems.length} item{attentionItems.length > 1 ? 's' : ''} waiting for you
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Button asChild size="sm" className="gap-1.5">
                  <Link to={item.url}>
                    {item.cta}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Explore your portal</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.url}
              to={link.url}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${link.color}`}
              >
                <link.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{link.title}</p>
                <p className="truncate text-xs text-muted-foreground">{link.description}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>

      {/* Progress + status */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Planning Progress</CardTitle>
            <CardDescription>
              {completed} of {event.milestones.length} milestones complete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} />
            <ul className="space-y-3">
              {event.milestones.map((milestone) => (
                <li key={milestone.title} className="flex items-center gap-3 text-sm">
                  {milestone.done ? (
                    <CheckCircle2 className="size-4 shrink-0 text-secondary" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={milestone.done ? '' : 'text-muted-foreground'}>
                    {milestone.title}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {formatDate(milestone.date)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">At a glance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contract</span>
                <Badge variant={myContract?.status === 'Signed' ? 'secondary' : 'destructive'}>
                  {myContract?.status ?? '—'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Balance due</span>
                <span className="font-semibold">{formatCurrency(balanceDue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gallery</span>
                <Badge variant="outline">{myGallery?.status ?? 'Pending'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending approvals</span>
                <span className="font-semibold">{pendingApprovals.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/10">
            <CardHeader>
              <CardTitle className="text-base">Your planner</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{event.planner}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Family Affair Key West
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Questions? Your planner is just a message away — request changes from the
                Timeline page anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
