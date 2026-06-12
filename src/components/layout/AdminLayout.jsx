import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { adminNavItems } from '@/lib/navigation'
import { SidebarBrand, SidebarNav, SidebarUser } from './Sidebar'
import { Topbar } from './Topbar'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

export default function AdminLayout() {
  const { role } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!role || role === 'Client') {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
