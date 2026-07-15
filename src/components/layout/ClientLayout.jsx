import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { CalendarHeart, Camera, Film, BadgeCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { clientNavItems } from '@/lib/navigation'
import { galleries } from '@/data/finance'
import { resolveClient } from '@/lib/client-scope'
import { formatDate, daysUntil } from '@/lib/utils'
import { SidebarBrand, SidebarNav, SidebarUser } from './Sidebar'
import { Topbar } from './Topbar'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

// Family Affair (planning): a warm gradient card with a countdown ring — the
// long wedding-planning journey at a glance.
function PlanningEventCard({ event }) {
  const done = event.milestones.filter((m) => m.done).length
  const progress = event.milestones.length ? Math.round((done / event.milestones.length) * 100) : 0
  const next = event.milestones.find((m) => !m.done)
  const days = daysUntil(event.date)

  return (
    <div className="relative mx-3 mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/65 p-3 text-sidebar-primary-foreground shadow-lg">
      <span className="pointer-events-none absolute -top-8 -right-6 size-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-medium tracking-wide uppercase opacity-80">Your event</p>
          <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm">{event.type}</span>
        </div>
        <p className="mt-1 truncate font-display text-base leading-tight font-semibold">{event.name}</p>

        <div className="mt-2.5 flex items-center gap-2.5 rounded-xl bg-white/12 p-2.5 backdrop-blur-sm">
          <div className="relative flex size-11 shrink-0 items-center justify-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" pathLength="100" strokeDasharray={`${progress} 100`} />
            </svg>
            <div className="text-center leading-none">
              <p className="font-display text-sm font-bold">{days}</p>
              <p className="text-[7px] uppercase tracking-wide opacity-80">days</p>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">{progress}% planned</p>
            {next
              ? <p className="mt-0.5 truncate text-[11px] opacity-75">Next: {next.title}</p>
              : <p className="mt-0.5 flex items-center gap-1 text-[11px] opacity-75"><CalendarHeart className="size-3" />{formatDate(event.date)}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

// Senses At Play (gallery): the brand's gold gradient card (no cover photo),
// gallery-centric content — deliberately distinct from the Family Affair
// planning/countdown card.
function GallerySessionCard({ cfg, event, gallery }) {
  const delivered = gallery?.status === 'Delivered'

  return (
    <div className="relative mx-3 mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/65 p-3 text-sidebar-primary-foreground shadow-lg">
      <span className="pointer-events-none absolute -top-8 -right-6 size-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-medium tracking-wide uppercase opacity-80">Your session</p>
          {delivered ? (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-800 shadow-sm">
              <BadgeCheck className="size-3" style={{ color: cfg.accent }} />Delivered
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm">Editing</span>
          )}
        </div>
        <p className="mt-1 truncate font-display text-base leading-tight font-semibold">{event.name}</p>

        <div className="mt-2.5 rounded-xl bg-white/12 p-2.5 backdrop-blur-sm">
          {delivered ? (
            <>
              <div className="flex items-center gap-3 text-xs opacity-90">
                <span className="flex items-center gap-1"><Camera className="size-3.5" />{gallery.photoCount} photos</span>
                <span className="flex items-center gap-1"><Film className="size-3.5" />{gallery.videoCount} films</span>
              </div>
              <p className="mt-1 text-[11px] opacity-75">Delivered {formatDate(gallery.deliveredDate)}</p>
            </>
          ) : (
            <p className="flex items-center gap-1.5 text-[11px] opacity-90"><CalendarHeart className="size-3.5" />{formatDate(event.date)} · editing ✨</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SidebarEventCard({ cfg, event, gallery }) {
  if (cfg.kind === 'gallery') return <GallerySessionCard cfg={cfg} event={event} gallery={gallery} />
  return <PlanningEventCard event={event} />
}

export default function ClientLayout() {
  const { role, user, brand } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (role !== 'Client') {
    return <Navigate to="/" replace />
  }

  const { cfg, me, event } = resolveClient(brand, user?.name)
  const gallery = galleries.find((g) => g.client === me?.name)
  // Log out back to the same brand's login (not the default Family Affair one).
  const loginPath = brand === 'senses-at-play' ? '/portal/senses-at-play' : '/'
  // Re-theme the whole client portal to the brand's accent so it matches that
  // brand's login page (Family Affair keeps the default green theme).
  const brandStyle = brand === 'family-affair'
    ? undefined
    : { '--primary': cfg.accent, '--ring': cfg.accent, '--sidebar-primary': cfg.accent, '--sidebar-ring': cfg.accent }

  return (
    <div className="flex min-h-screen w-full bg-background" style={brandStyle}>
      <aside className="hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <SidebarBrand subtitle="Client Portal" />
        <SidebarEventCard cfg={cfg} event={event} gallery={gallery} />
        <SidebarNav items={clientNavItems} />
        <SidebarUser loginPath={loginPath} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-72 flex-col gap-0 bg-sidebar p-0 text-sidebar-foreground [&_[data-slot=sheet-close]]:text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBrand subtitle="Client Portal" />
          <SidebarEventCard cfg={cfg} event={event} gallery={gallery} />
          <SidebarNav items={clientNavItems} onNavigate={() => setMobileOpen(false)} />
          <SidebarUser loginPath={loginPath} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} loginPath={loginPath} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
