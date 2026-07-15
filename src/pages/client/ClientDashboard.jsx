import { Link } from 'react-router-dom'
import {
  ArrowRight, CalendarHeart, CheckCircle2, ClipboardCheck, Circle, CreditCard,
  FileText, FolderOpen, GanttChartSquare, Image, MapPin, PenLine, Sparkles,
  Phone, Video, Ticket, ShieldCheck, Camera, Film, Images, Heart, User, BadgeCheck,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { resolveClient } from '@/lib/client-scope'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { contracts, invoices, galleries, approvals } from '@/data/finance'
import { meetings } from '@/data/meetings'
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils'

const firstNameOf = (name) => name?.split(/[\s&]+/)[0] ?? 'there'

const PREVIEW_PHOTOS = [
  '/images/gallery/g1.jpg', '/images/gallery/g2.jpg', '/images/gallery/g3.jpg',
  '/images/gallery/g4.jpg', '/images/gallery/g5.jpg', '/images/gallery/g6.jpg',
]

export default function ClientDashboard() {
  const { user, brand } = useAuth()
  const { cfg, me, event } = resolveClient(brand, user?.name)

  if (cfg.kind === 'gallery') return <GalleryDashboard cfg={cfg} me={me} event={event} />
  return <PlanningDashboard cfg={cfg} me={me} event={event} />
}

/* ============================ SHARED HERO ============================ */
// Logo-forward brand badge. The logo art already contains the brand name, so we
// show it large and legible (48px) and pair it with a two-line label instead of
// the tiny cluttered chip we had before.
function BrandChip({ cfg, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-3 rounded-2xl bg-white/95 p-2 pr-5 shadow-md ring-1 ring-black/5 backdrop-blur ${className}`}>
      <span className="flex size-14 items-center justify-center rounded-xl bg-white">
        <img src={cfg.logo} alt={cfg.name} className="size-12 object-contain" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-neutral-800">{cfg.name}</span>
        <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">{cfg.portalLabel}</span>
      </span>
    </div>
  )
}

function HeroShell({ cfg, children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl text-white shadow-lg">
      <img src={cfg.hero} alt="" className="absolute inset-0 size-full object-cover" style={{ objectPosition: cfg.heroPos }} />
      <div className="absolute inset-0" style={{ background: `linear-gradient(115deg, ${cfg.accentDark}f5, ${cfg.accentDark}d9 42%, ${cfg.accent}59)` }} />
      <div className="relative p-6 lg:p-8">
        <BrandChip cfg={cfg} className="mb-5" />
        {children}
      </div>
    </div>
  )
}

function QuickLinks({ links }) {
  return (
    <div>
      <h2 className="mb-3 font-display text-lg font-semibold">Explore your portal</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link key={link.url} to={link.url}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${link.color}`}><link.icon className="size-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{link.title}</p>
              <p className="truncate text-xs text-muted-foreground">{link.description}</p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ==================== SENSES AT PLAY — GALLERY DASHBOARD ==================== */
const galleryQuickLinks = [
  { title: 'Gallery', description: 'Your photos & films', url: '/client/gallery', icon: Images, color: 'bg-primary/10 text-primary' },
  { title: 'Invoices', description: 'Payments & receipts', url: '/client/invoices', icon: CreditCard, color: 'bg-secondary/10 text-secondary' },
  { title: 'Documents', description: 'Files shared with you', url: '/client/documents', icon: FolderOpen, color: 'bg-accent/20 text-accent-foreground' },
  { title: 'Approvals', description: 'Gallery release & sign-off', url: '/client/approvals', icon: ClipboardCheck, color: 'bg-primary/10 text-primary' },
  { title: 'Contracts', description: 'Your signed agreement', url: '/client/contracts', icon: FileText, color: 'bg-secondary/10 text-secondary' },
]

const wallSpan = (i) =>
  i === 0 ? 'col-span-2 row-span-2' : i === 3 ? 'row-span-2' : i === 6 ? 'col-span-2' : ''

function GalleryDashboard({ cfg, me, event }) {
  const firstName = firstNameOf(me?.name)
  const gallery = galleries.find((g) => g.client === me?.name)
  const myInvoice = invoices.find((i) => i.client === me?.name)
  const balanceDue = (myInvoice?.amount ?? 0) - (myInvoice?.paid ?? 0)
  const delivered = gallery?.status === 'Delivered'
  const wall = [...PREVIEW_PHOTOS, PREVIEW_PHOTOS[0], PREVIEW_PHOTOS[2]]

  return (
    <div className="flex flex-col gap-6">
      {/* Immersive, image-forward hero — an editorial gallery cover */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg">
        <img src={cfg.hero} alt="" className="h-[300px] w-full object-cover sm:h-[360px]" style={{ objectPosition: cfg.heroPos }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${cfg.accentDark}f5, ${cfg.accentDark}55 45%, ${cfg.accentDark}22)` }} />

        <BrandChip cfg={cfg} className="absolute left-5 top-5" />
        {gallery && (
          <Badge className="absolute right-5 top-5 gap-1 bg-white/90 text-neutral-800 shadow-sm" variant="secondary"><BadgeCheck className="size-3.5" />{gallery.status}</Badge>
        )}

        <div className="absolute inset-x-0 bottom-0 p-6 text-white lg:p-8">
          <p className="flex items-center gap-1.5 text-sm font-medium text-white/85"><Sparkles className="size-4" />Welcome back, {firstName}</p>
          <h1 className="mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight drop-shadow-md sm:text-4xl lg:text-5xl">
            {delivered ? 'Your gallery is ready ✨' : `We're editing your ${cfg.eventNoun}`}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
            <span className="font-medium">{event.name}</span>
            <span className="flex items-center gap-1.5"><Camera className="size-4" />{formatDate(event.date)}</span>
            <span className="flex items-center gap-1.5"><MapPin className="size-4" />{event.venue}</span>
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {delivered && (
              <Button asChild className="gap-1.5 bg-white text-neutral-800 hover:bg-white/90">
                <Link to="/client/gallery"><Images className="size-4" />View your gallery</Link>
              </Button>
            )}
            {gallery && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-md"><Camera className="size-3.5" />{gallery.photoCount} photos</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-md"><Film className="size-3.5" />{gallery.videoCount} films</span>
                {gallery.deliveredDate && <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-md"><BadgeCheck className="size-3.5" />Delivered {formatDate(gallery.deliveredDate)}</span>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Photo wall — the visual centrepiece (distinct from FA's milestone list) */}
      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Your photo wall</h2>
            <p className="text-xs text-muted-foreground">A peek at your favourites — open the gallery to see all {gallery?.photoCount ?? 0}.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-primary"><Link to="/client/gallery">View all<ArrowRight className="size-4" /></Link></Button>
        </div>
        <div className="grid auto-rows-[110px] grid-cols-2 gap-2.5 sm:grid-cols-4 sm:auto-rows-[130px]">
          {wall.map((src, i) => (
            <Link key={i} to="/client/gallery"
              className={`group relative overflow-hidden rounded-xl ring-1 ring-border ${wallSpan(i)}`}>
              <img src={src} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
              <Heart className="absolute right-2 top-2 size-4 text-white/0 drop-shadow transition-colors group-hover:text-white/90" />
            </Link>
          ))}
        </div>
      </div>

      {/* Compact info strip — horizontal, not a right sidebar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Camera className="size-4 text-primary" />Session</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{me?.package ?? event.type}</p>
            <p className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="size-3.5" />{event.venue}</p>
            <p className="flex items-center gap-1.5 text-muted-foreground"><Camera className="size-3.5" />{formatDate(event.date)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="size-4 text-primary" />Payment</CardTitle></CardHeader>
          <CardContent className="text-sm">
            {balanceDue > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Balance due</span><span className="font-semibold">{formatCurrency(balanceDue)}</span></div>
                <Button asChild size="sm" className="w-full"><Link to="/client/invoices">Pay now</Link></Button>
              </div>
            ) : (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-emerald-700"><BadgeCheck className="size-4" />Paid in full — thank you!</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-accent/10">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><User className="size-4 text-primary" />Your photographer</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{event.planner}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{cfg.name}</p>
            <p className="mt-2 text-xs text-muted-foreground">Favourite shots in your gallery or ask about prints &amp; albums.</p>
          </CardContent>
        </Card>
      </div>

      {/* Slim quick access */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick access</p>
        <div className="flex flex-wrap gap-2">
          {galleryQuickLinks.map((l) => (
            <Link key={l.url} to={l.url}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5">
              <l.icon className="size-4 text-primary" />{l.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ==================== FAMILY AFFAIR — PLANNING DASHBOARD ==================== */
const planningQuickLinks = [
  { title: 'Timeline', description: 'Milestones & day-of schedule', url: '/client/timeline', icon: GanttChartSquare, color: 'bg-primary/10 text-primary' },
  { title: 'Contracts', description: 'Review & sign documents', url: '/client/contracts', icon: FileText, color: 'bg-secondary/10 text-secondary' },
  { title: 'Documents', description: 'Files shared with you', url: '/client/documents', icon: FolderOpen, color: 'bg-accent/20 text-accent-foreground' },
  { title: 'Invoices', description: 'Balances & payments', url: '/client/invoices', icon: CreditCard, color: 'bg-primary/10 text-primary' },
  { title: 'Gallery', description: 'Your photos & sessions', url: '/client/gallery', icon: Image, color: 'bg-secondary/10 text-secondary' },
  { title: 'Approvals', description: 'Items awaiting your review', url: '/client/approvals', icon: ClipboardCheck, color: 'bg-accent/20 text-accent-foreground' },
]

function PlanningDashboard({ cfg, me, event }) {
  const days = daysUntil(event.date)
  const completed = event.milestones.filter((m) => m.done).length
  const progress = event.milestones.length ? Math.round((completed / event.milestones.length) * 100) : 0
  const firstName = firstNameOf(me?.name)

  const myContract = contracts.find((c) => c.client === me?.name)
  const myInvoice = invoices.find((i) => i.client === me?.name)
  const nextCall = meetings.find((m) => m.client === me?.name && m.status === 'Scheduled')
  const pendingApprovals = approvals.filter((a) => a.status === 'Pending' && a.client === me?.name)
  const balanceDue = (myInvoice?.amount ?? 0) - (myInvoice?.paid ?? 0)
  const nextMilestone = event.milestones.find((m) => !m.done)
  const creditsLeft = Math.max(0, (me?.creditsTotal ?? 0) - (me?.creditsUsed ?? 0))
  const needsOnboarding = me && me.onboarding !== 'Acknowledged'

  const attentionItems = [
    ...(myContract?.status === 'Awaiting Signature'
      ? [{ id: 'contract', icon: PenLine, title: 'Your contract is ready to sign', description: myContract.title, cta: 'Sign now', url: '/client/contracts' }]
      : []),
    ...pendingApprovals.map((item) => ({ id: item.id, icon: ClipboardCheck, title: `Approval needed: ${item.type}`, description: item.title, cta: 'Review', url: '/client/approvals' })),
    ...(balanceDue > 0
      ? [{ id: 'balance', icon: CreditCard, title: `Balance due: ${formatCurrency(balanceDue)}`, description: `Next payment due ${formatDate(myInvoice.dueDate)}`, cta: 'Pay now', url: '/client/invoices' }]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <HeroShell cfg={cfg}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-white/80"><Sparkles className="size-4" />Welcome back, {firstName}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold drop-shadow-sm lg:text-4xl">{event.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-white/85">
              <span className="flex items-center gap-1.5"><CalendarHeart className="size-4" />{formatDate(event.date)}</span>
              <span className="flex items-center gap-1.5"><MapPin className="size-4" />{event.venue}</span>
            </div>
            <div className="mt-5 max-w-sm">
              <div className="mb-1.5 flex items-center justify-between text-xs text-white/75"><span>Planning progress</span><span className="font-semibold text-white">{progress}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} /></div>
              {nextMilestone && <p className="mt-2 text-xs text-white/75">Up next: <span className="text-white">{nextMilestone.title}</span> · {formatDate(nextMilestone.date)}</p>}
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-center">
            <div className="rounded-2xl border border-white/25 bg-white/15 px-8 py-6 text-center backdrop-blur-md">
              <p className="font-display text-5xl font-bold lg:text-6xl">{days}</p>
              <p className="mt-1 text-xs font-medium tracking-widest text-white/75 uppercase">days to go</p>
            </div>
          </div>
        </div>
      </HeroShell>

      {needsOnboarding && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600"><ShieldCheck className="size-5" /></span>
              <div className="min-w-0">
                <p className="text-sm font-medium">Complete your onboarding</p>
                <p className="text-xs text-muted-foreground">Read your welcome pack and confirm the acknowledgement to unlock everything.</p>
              </div>
            </div>
            <Button asChild size="sm" className="gap-1.5"><Link to="/client/onboarding">Start<ArrowRight className="size-3.5" /></Link></Button>
          </CardContent>
        </Card>
      )}

      {attentionItems.length > 0 && (
        <Card className="border-accent/50 bg-gradient-to-br from-accent/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-base">Needs your attention</CardTitle>
            <CardDescription>{attentionItems.length} item{attentionItems.length > 1 ? 's' : ''} waiting for you</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {attentionItems.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="size-4" /></span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Button asChild size="sm" className="gap-1.5"><Link to={item.url}>{item.cta}<ArrowRight className="size-3.5" /></Link></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <QuickLinks links={planningQuickLinks} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Planning Progress</CardTitle>
            <CardDescription>{completed} of {event.milestones.length} milestones complete</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} />
            <ul className="space-y-3">
              {event.milestones.map((milestone) => (
                <li key={milestone.title} className="flex items-center gap-3 text-sm">
                  {milestone.done ? <CheckCircle2 className="size-4 shrink-0 text-secondary" /> : <Circle className="size-4 shrink-0 text-muted-foreground" />}
                  <span className={milestone.done ? '' : 'text-muted-foreground'}>{milestone.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">{formatDate(milestone.date)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Phone className="size-4 text-primary" />Consultation calls</CardTitle>
              <CardDescription>{creditsLeft} of {me?.creditsTotal ?? 0} call credits remaining</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground"><span>Used {me?.creditsUsed ?? 0}</span><span>{me?.creditsTotal ?? 0} total</span></div>
                <Progress value={me?.creditsTotal ? (me.creditsUsed / me.creditsTotal) * 100 : 0} className="h-1.5" />
              </div>
              {nextCall ? (
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{nextCall.type === 'Phone Call' ? <Phone className="size-4" /> : <Video className="size-4" />}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Next call · {nextCall.type}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(nextCall.date)} · {nextCall.time}</p>
                  </div>
                  <Badge variant="outline" className="gap-1"><Ticket className="size-3" />{nextCall.creditType}</Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No calls scheduled. Your planner will set up your next one.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="size-4 text-primary" />Payment schedule</CardTitle></CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle2 className="size-4 text-emerald-600" />Deposit</span><span className="font-medium">{formatCurrency(myInvoice?.deposit ?? 0)} paid</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Paid to date</span><span className="font-medium">{formatCurrency(myInvoice?.paid ?? 0)}</span></div>
              <div className="flex items-center justify-between border-t border-border pt-2.5"><span className="text-muted-foreground">Balance due</span><span className={balanceDue > 0 ? 'font-semibold' : 'font-semibold text-emerald-600'}>{formatCurrency(balanceDue)}</span></div>
              {balanceDue > 0 && myInvoice?.dueDate && (
                <p className="rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">Due by <span className="font-medium text-foreground">{formatDate(myInvoice.dueDate)}</span> — final payment is expected 60 days before your {cfg.eventNoun}.</p>
              )}
              <Button asChild variant="outline" size="sm" className="w-full"><Link to="/client/invoices">View invoice</Link></Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/10">
            <CardHeader className="pb-3"><CardTitle className="text-base">Your planner</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{event.planner}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{cfg.name}</p>
              <p className="mt-3 text-xs text-muted-foreground">Questions? Your planner is just a message away — request changes from the Timeline page anytime.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
