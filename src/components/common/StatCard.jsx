import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const accents = {
  primary: { icon: 'bg-primary/12 text-primary', glow: 'bg-primary/25', bar: 'bg-primary' },
  secondary: { icon: 'bg-secondary/12 text-secondary', glow: 'bg-secondary/25', bar: 'bg-secondary' },
  accent: { icon: 'bg-amber-500/15 text-amber-600', glow: 'bg-amber-400/30', bar: 'bg-amber-500' },
  navy: { icon: 'bg-foreground/10 text-foreground', glow: 'bg-foreground/15', bar: 'bg-foreground' },
}

export function StatCard({ label, value, icon: Icon, hint, accent = 'primary', trend, trendUp }) {
  const a = accents[accent] ?? accents.primary
  const TrendIcon = trendUp ? TrendingUp : TrendingDown

  return (
    <Card className="group relative overflow-hidden py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* accent edge */}
      <span className={cn('absolute inset-y-0 left-0 w-1', a.bar)} />
      {/* soft glow */}
      <span className={cn('pointer-events-none absolute -top-10 -right-8 size-28 rounded-full opacity-60 blur-2xl transition-opacity group-hover:opacity-100', a.glow)} />

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="pt-1 text-sm font-medium text-muted-foreground">{label}</p>
          <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl shadow-sm', a.icon)}>
            {Icon && <Icon className="size-5" />}
          </div>
        </div>

        <p className="mt-2 font-display text-[2rem] leading-none font-semibold tracking-tight">{value}</p>

        <div className="mt-2.5 flex items-center gap-2">
          {trend && (
            <span className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold',
              trendUp ? 'bg-emerald-500/15 text-emerald-600' : 'bg-destructive/15 text-destructive'
            )}>
              <TrendIcon className="size-3" />
              {trend}
            </span>
          )}
          {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
