import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Highlighted, color-coded brand chip so it's instantly clear which brand a row
// belongs to — Family Affair (green) vs Senses At Play (amber).
const tone = (brand) =>
  brand === 'Senses At Play'
    ? 'bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30'
    : 'bg-primary/15 text-primary ring-1 ring-primary/25'

export function BrandBadge({ brand, className }) {
  return (
    <Badge variant="secondary" className={cn('font-semibold', tone(brand), className)}>
      {brand || '—'}
    </Badge>
  )
}
