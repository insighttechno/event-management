import { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { adminNavItems } from '@/lib/navigation'
import { SidebarBrand, SidebarNav, SidebarUser } from './Sidebar'
import { Topbar } from './Topbar'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

export default function AdminLayout() {
  const { role } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  // <main> is the scroll container (the shell is h-screen), so the window never
  // scrolls — a route change would otherwise leave the new page mid-scroll.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  if (!role || role === 'Client') {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <SidebarBrand />
        <SidebarNav items={adminNavItems} />
        <SidebarUser />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-64 flex-col gap-0 bg-sidebar p-0 text-sidebar-foreground [&_[data-slot=sheet-close]]:text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBrand />
          <SidebarNav items={adminNavItems} onNavigate={() => setMobileOpen(false)} />
          <SidebarUser />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main ref={mainRef} className="flex-1 overflow-y-auto p-5 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
