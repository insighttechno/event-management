import { useState, useSyncExternalStore } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Lock, LogOut, ChevronDown, Check, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { getTeamMembers, subscribeTeam } from '@/lib/team-store'
import { getBrandConfig } from '@/data/brand-config'

const FA_LOGO = '/images/brand/family-affair.png'
const SAP_LOGO = '/images/brand/senses-at-play.png'

const BRANDS = [
  { id: 'all', name: 'All Brands', sub: 'Both businesses' },
  { id: 'fa', name: 'Family Affair', sub: 'Weddings & events', logo: FA_LOGO },
  { id: 'sap', name: 'Senses At Play', sub: 'Photography', logo: SAP_LOGO },
]

function BrandMark({ brand, small }) {
  const box = small ? 'h-9 min-w-9 px-1' : 'h-12 min-w-12 px-1'
  const img = small ? 'size-7' : 'size-10'
  if (brand.id === 'all') {
    return (
      <div className={cn('flex shrink-0 items-center justify-center gap-0.5 rounded-lg bg-white/95', box)}>
        <img src={FA_LOGO} alt="" className={small ? 'size-5' : 'size-6'} />
        <img src={SAP_LOGO} alt="" className={small ? 'size-5' : 'size-6'} />
      </div>
    )
  }
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-lg bg-white/95', box)}>
      <img src={brand.logo} alt={brand.name} className={cn(img, 'object-contain')} />
    </div>
  )
}

// Brand switcher — the admin manages BOTH brands from one place, so the panel
// never reads as "built for one brand".
export function SidebarBrand({ subtitle }) {
  const [active, setActive] = useState(BRANDS[0])
  const navigate = useNavigate()
  const { brand } = useAuth()

  // Client portal: a single, static brand identity (no switcher, no admin actions).
  if (subtitle) {
    const clientBrand = brand === 'senses-at-play' ? BRANDS[2] : BRANDS[1]
    const cfg = getBrandConfig(brand)
    return (
      <div className="border-b border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <BrandMark brand={clientBrand} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-display text-sm font-semibold leading-snug text-sidebar-foreground">{cfg.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{subtitle}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-sidebar-border p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sidebar-accent">
            <BrandMark brand={active} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate font-display text-sm font-semibold text-sidebar-foreground">
                {active.name}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">{active.sub}</p>
            </div>
            <ChevronDown className="size-4 shrink-0 text-sidebar-foreground/50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel>Switch brand</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {BRANDS.map((brand) => (
            <DropdownMenuItem key={brand.id} className="gap-2.5" onClick={() => setActive(brand)}>
              <BrandMark brand={brand} small />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium">{brand.name}</p>
                <p className="truncate text-xs text-muted-foreground">{brand.sub}</p>
              </div>
              {active.id === brand.id && <Check className="size-4 shrink-0 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2.5" onClick={() => navigate('/admin/brands', { state: { addNew: true } })}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
              <Plus className="size-4" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium">Add new business</p>
              <p className="truncate text-xs text-muted-foreground">Create a new brand & portal</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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

  let lastSection = null

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      {visible.map((item) => {
        const showSection = item.section && item.section !== lastSection
        lastSection = item.section

        const sectionLabel = showSection ? (
          <p
            key={`section-${item.section}`}
            className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/40 first:pt-1"
          >
            {item.section}
          </p>
        ) : null

        if (isLocked(item)) {
          return (
            <div key={item.url}>
              {sectionLabel}
              <button
                type="button"
                onClick={() =>
                  toast.info(`You don't have access to ${item.title}.`, {
                    description: 'Ask your administrator to assign it from the Team page.',
                  })
                }
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-sidebar-foreground/35 transition-colors hover:bg-sidebar-accent/40"
              >
                <item.icon className="size-4 shrink-0" />
                {item.title}
                <Lock className="ml-auto size-3.5 shrink-0" />
              </button>
            </div>
          )
        }
        return (
          <div key={item.url}>
            {sectionLabel}
            <NavLink
              to={item.url}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )
              }
            >
              <item.icon className="size-4 shrink-0" />
              {item.title}
            </NavLink>
          </div>
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
