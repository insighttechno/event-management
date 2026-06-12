import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { CalendarHeart, MapPin } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useTenant } from '@/hooks/use-tenant'
import { clientNavItems } from '@/lib/navigation'
import { eventsService } from '@/services/events'
import { formatDate } from '@/lib/utils'
import { SidebarBrand, SidebarNav, SidebarUser } from './Sidebar'
import { Topbar } from './Topbar'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

function daysUntil(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil((new Date(date) - today) / 86400000))
}

function SidebarEventCard({ event }) {
  const days = daysUntil(event.date)
  return (
    <div className="mx-3 mt-4 rounded-xl bg-gradient-to-br from-sidebar-primary/90 to-sidebar-primary/60 p-4 text-sidebar-primary-foreground shadow-lg">
      <p className="text-xs font-medium tracking-wide uppercase opacity-80">Your event</p>
      <p className="mt-1 font-display text-lg leading-tight font-semibold">{event.name}</p>
      <div className="mt-3 space-y-1 text-xs opacity-90">
        <p className="flex items-center gap-1.5">
          <CalendarHeart className="size-3.5" />
          {formatDate(event.date)}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {event.venue}
        </p>
      </div>
      <div className="mt-3 rounded-lg bg-white/15 px-3 py-2 text-center backdrop-blur-sm">
        <p className="font-display text-2xl font-bold">{days}</p>
        <p className="text-[11px] tracking-wide uppercase opacity-80">days to go</p>
      </div>
    </div>
  )
}

export default function ClientLayout() {
  const { role } = useAuth()
  const { tenant } = useTenant()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (role !== 'Client') {
    return <Navigate to="/" replace />
  }

  // The demo client account is linked to the workspace's first event.
  const myEvent = eventsService.list()[0]

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <SidebarBrand subtitle="Client Portal" />
        {myEvent && <SidebarEventCard event={myEvent} />}
        <SidebarNav items={clientNavItems} />
        <SidebarUser loginPath="/" />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-72 flex-col gap-0 bg-sidebar p-0 text-sidebar-foreground [&_[data-slot=sheet-close]]:text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBrand subtitle="Client Portal" />
          {myEvent && <SidebarEventCard event={myEvent} />}
          <SidebarNav items={clientNavItems} onNavigate={() => setMobileOpen(false)} />
          <SidebarUser loginPath="/" />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} loginPath="/" />
        {/* Keyed by tenant so pages re-read services on workspace switch */}
        <main key={tenant.id} className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
            {myEvent ? (
              <Outlet />
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="font-display text-xl font-semibold">No event yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This workspace has no events linked to your account yet. Your planner
                  will set this up for you.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
