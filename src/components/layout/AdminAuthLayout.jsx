import { Outlet } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function AdminAuthLayout() {
  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[oklch(0.22_0.04_225)] p-4">
      {/* Full-screen photo background */}
      <div className="absolute inset-0">
        <img
          src="/images/auth/admin-bg.jpg"
          alt=""
          className="size-full object-cover"
        />
        {/* Dark overlays so the card and text stay readable */}
        <div className="absolute inset-0 bg-[oklch(0.22_0.04_225)]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.04_225)]/85 via-transparent to-[oklch(0.22_0.04_225)]/40" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/15 mix-blend-overlay" />
      </div>

      {/* Soft accent glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 size-80 rounded-full bg-secondary/15 blur-3xl" />
      </div>

      {/* max-h + internal scroll only as a safety net on very short screens */}
      <div className="relative z-10 max-h-full w-full max-w-md overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="rounded-3xl border border-white/25 bg-card/85 p-5 shadow-2xl backdrop-blur-2xl sm:p-7">
          <div className="mb-5 flex flex-col items-center gap-2.5 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary font-display text-xl font-semibold text-primary-foreground shadow-lg shadow-primary/40">
              FA
            </div>
            <div className="leading-tight">
              <p className="font-display text-xl font-semibold">
                Family Affair Key West
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-0.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <ShieldCheck className="size-3.5" />
                Staff Portal
              </p>
            </div>
          </div>

          <Outlet context={{ signInPath: '/admin/login' }} />
        </div>

        <p className="mt-4 text-center text-xs text-white/70 drop-shadow">
          Authorized staff only · Family Affair Key West &amp; Senses At Play
        </p>
      </div>
    </div>
  )
}
