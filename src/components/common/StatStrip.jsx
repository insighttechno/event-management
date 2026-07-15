import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Compact horizontal stat strip — a lighter alternative to the big StatCard grid.
// Pass items: { label, value, icon, accent }.
const tone = {
  primary: 'bg-primary/12 text-primary',
  secondary: 'bg-secondary/12 text-secondary',
  accent: 'bg-amber-500/15 text-amber-600',
  navy: 'bg-foreground/10 text-foreground',
}

export function StatStrip({ items }) {
  return (
    <Card className="py-0">
      <CardContent className="flex flex-col divide-y divide-border p-0 sm:flex-row sm:divide-x sm:divide-y-0">
        {items.map((it) => (
          <div key={it.label} className="flex flex-1 items-center gap-3 px-4 py-3">
            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', tone[it.accent] ?? tone.primary)}>
              {it.icon && <it.icon className="size-4.5" />}
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold leading-none">{it.value}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{it.label}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
