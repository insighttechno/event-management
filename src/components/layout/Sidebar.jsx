import { useSyncExternalStore } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Lock, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { getTeamMembers, subscribeTeam } from '@/lib/team-store'

export function SidebarBrand({ subtitle = '& Senses At Play' }) {
  return (
    <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-display text-lg font-semibold text-sidebar-primary-foreground">
        FA
      </div>
      <div className="leading-tight">
        <p className="font-display text-base font-semibold text-sidebar-foreground">
          Family Affair
        </p>
        <p className="text-xs text-sidebar-foreground/60">{subtitle}</p>
      </div>
    </div>
  )
}

export function SidebarNav({ items, onNavigate }) {
  const { role, user } = useAuth()
  const members = useSyncExternalStore(subscribeTeam, getTeamMembers)

  // Team Members see every admin tab, but only their assigned modules are
  // enabled — the rest show locked so they know what exists and who to ask.
  const me =
    role === 'Team Member'
      ? members.find((member) => member.name === user?.name)
      : null

  const isLocked = (item) => {
    if (!item.roles) return false // client nav — no module gating
    if (role !== 'Team Member') return !item.roles.includes(role)
    if (!me) return !item.roles.includes(role) // unknown member: old role-based behavior
    return !me.modules.includes(item.title)
  }

  // Admins (and clients) only see what their role allows; Team Members see all tabs.
  const visible =
    role === 'Team Member' && me
      ? items
      : items.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {visible.map((item) => {
        if (isLocked(item)) {
          return (
            <button
              key={item.url}
              type="button"
              onClick={() =>
                toast.info(`You don't have access to ${item.title}.`, {
                  description: 'Ask your administrator to assign it from the Team page.',
                })
              }
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-sidebar-foreground/35 transition-colors hover:bg-sidebar-accent/40"
            >
              <item.icon className="size-4 shrink-0" />
              {item.title}
              <Lock className="ml-auto size-3.5 shrink-0" />
            </button>
          )
        }
        return (
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
        )
      })}
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
