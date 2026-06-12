import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const accentClasses = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  accent: 'bg-accent/20 text-accent-foreground',
  navy: 'bg-foreground/10 text-foreground',
}

export function StatCard({ label, value, icon: Icon, hint, accent = 'primary' }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl',
            accentClasses[accent]
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
