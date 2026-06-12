import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Building2, Check, ChevronsUpDown, Plus, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ProfileDialog } from '@/components/common/ProfileDialog'
import { useAuth } from '@/hooks/use-auth'
import { useTenant } from '@/hooks/use-tenant'
import { notificationsService } from '@/services/notifications'

function WorkspaceSwitcher() {
  const navigate = useNavigate()
  const { tenant, tenants, switchTenant } = useTenant()
  const switchable = tenants.filter(
    (item) => item.seeded && item.status !== 'Suspended'
  )

  const handleSwitch = (item) => {
    if (item.id === tenant.id) return
    switchTenant(item.id)
    toast.success(`Switched to ${item.name}.`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hidden gap-2 sm:flex">
          <Building2 className="size-4 text-muted-foreground" />
          <span className="max-w-36 truncate text-sm font-medium">{tenant.name}</span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Workspaces
        </DropdownMenuLabel>
        {switchable.map((item) => (
          <DropdownMenuItem
            key={item.id}
            className="gap-2.5"
            onClick={() => handleSwitch(item)}
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
              style={{ backgroundColor: item.brandColor }}
            >
              {item.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{item.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {item.subdomain}.eventcrm.app
              </span>
            </span>
            {item.id === tenant.id && <Check className="size-4 shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2.5" onClick={() => navigate('/get-started')}>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-dashed border-border">
            <Plus className="size-4 text-muted-foreground" />
          </span>
          <span className="text-sm">Add workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Topbar({ onMenuClick, loginPath = '/admin/login' }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { saasDemo, tenant } = useTenant()
  const [notifications, setNotifications] = useState(() => notificationsService.list())
  const [profileOpen, setProfileOpen] = useState(false)

  // The topbar lives outside the tenant-keyed subtree, so re-read on switch.
  const [lastTenantId, setLastTenantId] = useState(tenant.id)
  if (lastTenantId !== tenant.id) {
    setLastTenantId(tenant.id)
    setNotifications(notificationsService.list())
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id) => {
    notificationsService.update(id, { read: true })
    setNotifications(notificationsService.list())
  }

  const markAllAsRead = () => {
    notifications.forEach((n) => notificationsService.update(n.id, { read: true }))
    setNotifications(notificationsService.list())
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="size-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      <div className="min-w-0 flex-1">
        <div className="relative hidden max-w-md md:block">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="w-full bg-muted/40 pl-8" />
        </div>
      </div>

      {saasDemo && <WorkspaceSwitcher />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-xs font-normal text-primary hover:underline"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No notifications
            </p>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-2 py-2.5"
                onSelect={(event) => {
                  event.preventDefault()
                  markAsRead(notification.id)
                }}
              >
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    notification.read ? 'bg-transparent' : 'bg-primary'
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {notification.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {notification.description}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {notification.time}
                  </span>
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-1.5">
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>Edit profile</DropdownMenuItem>
          {saasDemo && (
            <DropdownMenuItem onClick={() => navigate('/superadmin')}>
              <ShieldCheck className="size-4" />
              Platform Console
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              logout()
              navigate(loginPath)
            }}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  )
}
