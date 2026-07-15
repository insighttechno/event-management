import { ShieldCheck, Check, ArrowRight, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const GOLD = '#c2a15b'
const QUOTE_LINK = 'https://www.consumersadvocate.org/wedding-insurance/best-wedding-insurance'

const realLife = [
  'Death of a child',
  'Hospitalization of a parent while in Key West',
  'Groom suffered a stroke — unable to travel',
  'Bride in a car accident requiring 6 months of rehab',
]

const covers = [
  'Cancellation or postponement before the wedding date (up to midnight the night before)',
  'On average ~1% of coverage — about $250 for $25k of protection',
  'Protects a $25k–$60k investment for just a few hundred dollars',
]

// Public wedding-insurance guidance (Step 11 / 5.9). Included in the invoice
// bundle and the client onboarding centre — presented as real guidance, not
// contract fine print.
export default function WeddingInsurance() {
  return (
    <div className="min-h-screen bg-[#f6f3ec] px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-5">
            <img src="/images/brand/family-affair.png" alt="Family Affair Key West" className="h-16 w-16 object-contain" />
            <span className="h-12 w-px bg-neutral-300" />
            <img src="/images/brand/senses-at-play.png" alt="Senses at Play" className="h-16 w-16 object-contain" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
            Family Affair · Senses At Play
          </p>
        </div>

        <Card>
          <CardContent className="space-y-7 p-6 sm:p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-7" />
              </div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">Protect your celebration</h1>
              <p className="max-w-md text-sm text-muted-foreground">
                This is too important to be just fine print in your contract. For a few hundred dollars, wedding
                insurance protects your investment from a major loss — so let's take a moment to review it.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Heart className="size-4 text-amber-600" /> Real situations from this past year
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                Each of these required a cancellation just weeks before the wedding — and each would have been covered:
              </p>
              <ul className="space-y-1.5 text-sm">
                {realLife.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />{r}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold">What a standard policy covers</p>
              <ul className="space-y-2">
                {covers.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />{c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-muted/40 p-4 text-center">
              <p className="text-sm font-medium">Ready to protect your day?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Feel free to compare providers, or request a quote from a company many of our couples have used.
              </p>
              <Button asChild size="lg" className="mt-3 gap-2">
                <a href={QUOTE_LINK} target="_blank" rel="noreferrer">
                  Request a wedding insurance quote <ArrowRight className="size-4.5" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Included with your invoice and in your client onboarding centre.
        </p>
      </div>
    </div>
  )
}
