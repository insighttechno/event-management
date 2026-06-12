import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useTenant } from '@/hooks/use-tenant'

export function SidebarBrand({ subtitle }) {
  const { tenant } = useTenant()
  return (
    <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-display text-lg font-semibold text-sidebar-primary-foreground">
        {tenant.initials}
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate font-display text-base font-semibold text-sidebar-foreground">
          {tenant.name}
        </p>
        <p className="truncate text-xs text-sidebar-foreground/60">
          {subtitle ?? tenant.tagline}
        </p>
      </div>
    </div>
  )
}

export function SidebarNav({ items, onNavigate }) {
  const { role } = useAuth()
  const visible = items.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {visible.map((item) => (
        <NavLink
          key={item.url}
          to={item.url}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )
          }
        >
          <item.icon className="size-4 shrink-0" />
          {item.title}
        </NavLink>
      ))}
    </nav>
  )
}

export function SidebarUser({ loginPath = '/admin/login' }) {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <div className="border-t border-sidebar-border p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <Avatar size="sm">
          <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
          <p className="truncate text-xs text-sidebar-foreground/60">{role}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => {
            logout()
            navigate(loginPath)
          }}
          title="Log out"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </div>
  )
}
