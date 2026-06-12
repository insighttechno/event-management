import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { authShowcase } from '@/lib/auth-showcase'
import { useTenant } from '@/hooks/use-tenant'

export function AuthShell({ roles, previewRole, outletContext }) {
  const { tenant } = useTenant()
  const content = authShowcase[previewRole]

  return (
    <div className="flex min-h-screen bg-background lg:h-screen lg:overflow-hidden">
      <div className="relative hidden w-1/2 overflow-hidden text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-8 xl:p-10">
        <div className="absolute inset-0">
          {roles.map((role) => (
            <img
              key={role}
              src={authShowcase[role].image}
              alt=""
              className={cn(
                'absolute inset-0 size-full object-cover transition-opacity duration-700 ease-in-out',
                previewRole === role ? 'opacity-100' : 'opacity-0'
              )}
            />
          ))}
          <div className="absolute inset-0 bg-sidebar/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/35 via-transparent to-secondary/25 mix-blend-overlay" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 font-display text-xl font-semibold backdrop-blur-sm">
            {tenant.initials}
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold">{tenant.name}</p>
            <p className="text-xs text-primary-foreground/70">{tenant.tagline}</p>
          </div>
        </div>

        <div
          key={previewRole}
          className="relative z-10 max-w-xl py-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3.5 py-1.5 text-xs font-semibold tracking-widest text-accent uppercase backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {content.badge}
          </span>

          <h1 className="mt-3 font-display text-4xl leading-tight font-semibold text-balance xl:text-5xl">
            {content.title}
          </h1>

          <p className="mt-3 max-w-md text-base leading-relaxed text-primary-foreground/85">
            {content.description}
          </p>

          <ul className="mt-5 space-y-2.5">
            {content.highlights.map((item) => (
              <li
                key={item.title}
                className="group flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 backdrop-blur-md transition-colors duration-300 hover:border-accent/40 hover:bg-white/15"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/40 to-primary/30 transition-transform duration-300 group-hover:scale-105">
                  <item.icon className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm leading-snug font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-primary-foreground/70">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div
          key={`${previewRole}-stat`}
          className="relative z-10 max-w-xl overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-white/15 via-white/10 to-white/5 p-4 backdrop-blur-xl animate-in fade-in duration-500"
        >
          <div className="absolute -top-10 -right-6 size-28 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary px-3 font-display text-xl font-bold text-white shadow-lg shadow-primary/30">
              {content.stat.value}
            </div>
            <p className="text-sm leading-snug text-primary-foreground/90">
              {content.stat.label}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center overflow-y-auto px-4 py-10 sm:px-8 lg:w-1/2 lg:px-16 lg:py-12 xl:px-20">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-lg font-semibold text-primary-foreground">
            {tenant.initials}
          </div>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold">{tenant.name}</p>
            <p className="text-xs text-muted-foreground">{tenant.tagline}</p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Outlet context={outletContext} />
        </div>
      </div>
    </div>
  )
}
