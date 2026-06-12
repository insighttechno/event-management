import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { authShowcase } from '@/lib/auth-showcase'

export function AuthShell({ roles, previewRole, outletContext }) {
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
          {/* Lighter center so the photo shines; strong bottom anchor for text */}
          <div className="absolute inset-0 bg-gradient-to-t from-sidebar/95 via-sidebar/25 to-sidebar/45" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-secondary/20 mix-blend-overlay" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl border border-white/20 bg-white/15 font-display text-xl font-semibold shadow-lg backdrop-blur-md">
            FA
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold drop-shadow">Family Affair Key West</p>
            <p className="text-xs text-primary-foreground/75">&amp; Senses At Play</p>
          </div>
        </div>

        <div
          key={previewRole}
          className="relative z-10 max-w-xl py-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-widest uppercase shadow-lg backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {content.badge}
          </span>

          <h1 className="mt-4 font-display text-4xl leading-tight font-semibold text-balance drop-shadow-md xl:text-5xl">
            {content.title}
          </h1>

          <p className="mt-3 max-w-md text-base leading-relaxed text-primary-foreground/90 drop-shadow">
            {content.description}
          </p>

          <ul className="mt-6 space-y-2.5">
            {content.highlights.map((item) => (
              <li
                key={item.title}
                className="group flex items-center gap-3.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-xl transition-all duration-300 hover:translate-x-1 hover:border-accent/50 hover:bg-white/15"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary shadow-md shadow-primary/30 transition-transform duration-300 group-hover:scale-110">
                  <item.icon className="size-4.5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm leading-snug font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-primary-foreground/75">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div
          key={`${previewRole}-stat`}
          className="relative z-10 max-w-xl overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-xl animate-in fade-in duration-500"
        >
          <div className="absolute -top-10 -right-6 size-28 rounded-full bg-accent/40 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 size-24 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary px-3 font-display text-xl font-bold text-white shadow-lg shadow-primary/40">
              {content.stat.value}
            </div>
            <p className="text-sm leading-snug text-primary-foreground/95">
              {content.stat.label}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center overflow-y-auto px-4 py-10 sm:px-8 lg:w-1/2 lg:px-16 lg:py-12 xl:px-20">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-lg font-semibold text-primary-foreground">
            FA
          </div>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold">Family Affair Key West</p>
            <p className="text-xs text-muted-foreground">&amp; Senses At Play</p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Outlet context={outletContext} />
        </div>
      </div>
    </div>
  )
}
