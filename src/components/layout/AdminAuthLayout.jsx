import { Outlet } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function AdminAuthLayout() {
  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[oklch(0.22_0.04_225)] p-4">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 size-80 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 size-64 rounded-full bg-accent/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 grid max-h-full w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 shadow-2xl lg:grid-cols-2">
        {/* Photo panel — image lives in a fixed pane so it always looks composed, never cut */}
        <div className="relative hidden lg:block">
          <img
            src="/images/auth/admin-side.jpg"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.04_225)]/85 via-[oklch(0.22_0.04_225)]/15 to-[oklch(0.22_0.04_225)]/35" />

          <div className="relative z-10 flex h-full flex-col justify-between p-7 text-white">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 font-display text-lg font-semibold backdrop-blur-md">
                FA
              </div>
              <div className="leading-tight">
                <p className="font-display text-base font-semibold">Family Affair Key West</p>
                <p className="text-xs text-white/75">&amp; Senses At Play</p>
              </div>
            </div>

            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide uppercase backdrop-blur-md">
                <ShieldCheck className="size-3.5" />
                Staff Portal
              </p>
              <p className="mt-3 font-display text-2xl leading-snug font-semibold text-balance">
                Every celebration, managed beautifully.
              </p>
              <p className="mt-1.5 text-sm text-white/80">
                Leads, events, vendors, contracts &amp; payments — one place.
              </p>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="overflow-y-auto bg-card p-6 [scrollbar-width:none] sm:p-8 lg:p-10 [&::-webkit-scrollbar]:hidden">
          {/* Compact brand header for small screens (photo panel hidden there) */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-lg font-semibold text-primary-foreground">
              FA
            </div>
            <div className="leading-tight">
              <p className="font-display text-base font-semibold">Family Affair Key West</p>
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ShieldCheck className="size-3" />
                Staff Portal
              </p>
            </div>
          </div>

          <Outlet context={{ signInPath: '/admin/login' }} />
        </div>
      </div>
    </div>
  )
}
