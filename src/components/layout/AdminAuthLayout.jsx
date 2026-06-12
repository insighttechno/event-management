import { Outlet } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function AdminAuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[oklch(0.22_0.04_225)] p-4">
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

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-semibold text-primary-foreground shadow-lg shadow-primary/30">
            FA
          </div>
          <div className="leading-tight">
            <p className="font-display text-xl font-semibold text-white">
              Family Affair Key West
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/80 uppercase backdrop-blur-sm">
              <ShieldCheck className="size-3.5" />
              Staff Portal
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card p-6 shadow-2xl sm:p-8">
          <Outlet context={{ signInPath: '/admin/login' }} />
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          Authorized staff only · Family Affair Key West &amp; Senses At Play
        </p>
      </div>
    </div>
  )
}
