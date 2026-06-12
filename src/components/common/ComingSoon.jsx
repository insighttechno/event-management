import { Card, CardContent } from '@/components/ui/card'

export function ComingSoon({ icon: Icon, title, description, items = [] }) {
  return (
    <Card className="border-dashed bg-muted/30 shadow-none">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        {Icon && (
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-7" />
          </div>
        )}
        <div className="max-w-md space-y-1">
          <p className="font-display text-lg font-semibold">{title}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {items.length > 0 && (
          <ul className="mt-2 grid gap-2 text-left text-sm text-muted-foreground sm:grid-cols-2">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
