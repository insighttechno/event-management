import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Shared header for in-page forms — every add/edit opens on its own page with
// a clear way back, never in a popup.
export function BackHeader({ title, description, onBack, backLabel = 'Back' }) {
  return (
    <div className="mb-6">
      <Button variant="ghost" size="sm" className="-ml-2 mb-3 gap-1.5" onClick={onBack}>
        <ArrowLeft className="size-4" />
        {backLabel}
      </Button>
      <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}
