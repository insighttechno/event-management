import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell } from 'lucide-react'
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
import { resolveClient } from '@/lib/client-scope'
import {
  adminNotifications, getClientNotifications, notificationTypes, defaultNotificationType,
} from '@/data/notifications'

export function Topbar({ onMenuClick, loginPath = '/admin/login' }) {
  const navigate = useNavigate()
  const { user, role, brand, logout } = useAuth()
  // Admins see business-wide notifications; clients see their own brand-aware set.
  const [notifications, setNotifications] = useState(() => {
    if (role === 'Client') {
      const { cfg, event } = resolveClient(brand, user?.name)
      return getClientNotifications(cfg, event)
    }
    return adminNotifications
  })
  const [profileOpen, setProfileOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
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
            notifications.map((notification) => {
              const meta = notificationTypes[notification.type] ?? defaultNotificationType
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-2 py-2.5 focus:bg-[#FEFBF7] focus:text-neutral-800"
                  onSelect={(event) => {
                    event.preventDefault()
                    markAsRead(notification.id)
                  }}
                >
                  <span
                    className={`mt-2 size-2 shrink-0 rounded-full ${
                      notification.read ? 'bg-transparent' : 'bg-primary'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 flex items-center gap-1.5">
                      <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}>
                        {meta.label}
                      </span>
                      <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{notification.time}</span>
                    </span>
                    <span className="block text-sm font-medium">
                      {notification.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {notification.description}
                    </span>
                  </span>
                </DropdownMenuItem>
              )
            })
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
