import { Outlet } from 'react-router-dom'
import { ShieldCheck, UserPlus, CalendarHeart, DollarSign, TrendingUp } from 'lucide-react'

// Sage-green + gold palette pulled straight from the Family Affair & Senses At
// Play logos, so the login feels like an extension of the brands themselves.
const GOLD = '#e3c988'

// Static, illustrative numbers — this is a *preview* of the admin dashboard,
// there purely to signal "you are entering a management tool", not real data.
const STATS = [
  { icon: UserPlus, label: 'New leads', value: '12', delta: '+3 this week' },
  { icon: CalendarHeart, label: 'Upcoming events', value: '8', delta: 'next 30 days' },
  { icon: DollarSign, label: 'Revenue (MTD)', value: '$24k', delta: '+18%' },
]
const BARS = [42, 60, 48, 76, 64, 88, 72]
const PIPELINE = [
  { who: 'Emma & Liam', where: 'Casa Marina Resort', tag: 'New', tone: 'bg-emerald-400/25 text-emerald-100' },
  { who: 'Marcus & Devon', where: 'Hemingway House', tag: 'Call booked', tone: 'bg-amber-300/25 text-amber-100' },
]

export default function AdminAuthLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f3ec]">
      {/* ---------- Left: management-tool preview panel ---------- */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        {/* Brand gradient (sage → teal → navy) reads as "software", not "romance" */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(140deg, oklch(0.44 0.07 168) 0%, oklch(0.33 0.055 205) 52%, oklch(0.25 0.05 230) 100%)',
          }}
        />
        {/* Soft depth */}
        <div className="absolute -top-24 -left-16 size-80 rounded-full bg-[#e3c988]/15 blur-3xl" />
        <div className="absolute right-[-6rem] bottom-[-4rem] size-96 rounded-full bg-primary/25 blur-3xl" />
        {/* Faint grid — the classic "dashboard" texture */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Thin gold frame */}
        <div
          className="pointer-events-none absolute inset-5 rounded-[1.75rem] border"
          style={{ borderColor: 'rgba(227,201,136,0.45)' }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white xl:p-12">
          {/* Portal label */}
          <span
            className="inline-flex w-fit items-center gap-2 text-xs font-semibold tracking-[0.24em] uppercase"
            style={{ color: GOLD }}
          >
            <ShieldCheck className="size-4" />
            Admin &amp; Team Portal
          </span>

          {/* Dashboard preview card */}
          <div className="my-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">Dashboard</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/80">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Both brands
                </span>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-2.5">
                {STATS.map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/10 p-3">
                    <s.icon className="size-4 text-white/70" />
                    <p className="mt-2 font-display text-xl font-semibold leading-none">{s.value}</p>
                    <p className="mt-1.5 text-[10px] leading-tight text-white/65">{s.label}</p>
                    <p className="text-[10px] font-medium" style={{ color: GOLD }}>{s.delta}</p>
                  </div>
                ))}
              </div>

              {/* Mini bookings chart */}
              <div className="mt-3 rounded-xl bg-white/10 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-medium text-white/80">Bookings</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300">
                    <TrendingUp className="size-3" /> trending up
                  </span>
                </div>
                <div className="flex h-16 items-end gap-1.5">
                  {BARS.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${h}%`,
                        background: i === BARS.length - 2
                          ? 'linear-gradient(to top, #e3c988, #f0dcab)'
                          : 'rgba(255,255,255,0.35)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Leads pipeline peek */}
              <div className="mt-3 space-y-2">
                {PIPELINE.map((p) => (
                  <div key={p.who} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-white/15 text-[10px] font-semibold">
                      {p.who.split(' ')[0][0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{p.who}</p>
                      <p className="truncate text-[10px] text-white/60">{p.where}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ${p.tone}`}>
                      {p.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Operational tagline */}
          <div>
            <h1 className="font-display text-3xl leading-tight font-semibold text-balance drop-shadow xl:text-[2.5rem]">
              Your studio command center.
            </h1>
            <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-white/80">
              Run both brands from one place — leads, events, contracts,
              payments and your team.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Right: sign-in panel (fits one screen, no scroll) ---------- */}
      <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden px-6 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Both brand logos, side by side */}
          <div className="mb-4 flex items-center justify-center gap-6">
            <img
              src="/images/brand/family-affair.png"
              alt="Family Affair Key West"
              className="h-28 w-28 object-contain"
            />
            <span className="h-20 w-px bg-neutral-300" />
            <img
              src="/images/brand/senses-at-play.png"
              alt="Senses at Play"
              className="h-28 w-28 object-contain"
            />
          </div>

          {/* Clear "which portal am I in" badge — admin + team both sign in here */}
          <div className="mb-7 flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase"
              style={{ borderColor: 'rgba(194,161,91,0.5)', color: '#c2a15b', background: 'rgba(194,161,91,0.08)' }}
            >
              <ShieldCheck className="size-3.5" />
              Admin &amp; Team Portal
            </span>
          </div>

          <Outlet context={{ signInPath: '/admin/login' }} />
        </div>
      </div>
    </div>
  )
}
