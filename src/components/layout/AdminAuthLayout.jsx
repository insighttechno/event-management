import { Outlet } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function AdminAuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[oklch(0.22_0.04_225)] p-4">
      {/* Full-screen photo background */}
      <div className="absolute inset-0">
        <img
          src="/images/auth/admin.jpg"
          alt=""
          className="size-full object-cover"
        />
        {/* Dark overlays so the card and text stay readable */}
        <div className="absolute inset-0 bg-[oklch(0.22_0.04_225)]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.04_225)]/90 via-transparent to-[oklch(0.22_0.04_225)]/50" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-secondary/20 mix-blend-overlay" />
      </div>

      {/* Soft accent glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 size-80 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/25 bg-card/85 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-semibold text-primary-foreground shadow-lg shadow-primary/40">
              FA
            </div>
            <div className="leading-tight">
              <p className="font-display text-xl font-semibold">
                Family Affair Key West
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <ShieldCheck className="size-3.5" />
                Staff Portal
              </p>
            </div>
          </div>

          <Outlet context={{ signInPath: '/admin/login' }} />
        </div>

        <p className="mt-6 text-center text-xs text-white/70 drop-shadow">
          Authorized staff only · Family Affair Key West &amp; Senses At Play
        </p>
      </div>
    </div>
  )
}
