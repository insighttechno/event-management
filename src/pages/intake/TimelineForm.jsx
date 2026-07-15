import { useState } from 'react'
import { CheckCircle2, ArrowRight, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const GOLD = '#c2a15b'

const empty = {
  couple: '', eventDate: '', getReady: '', ceremony: '', cocktail: '', reception: '',
  firstDance: '', parentDances: '', toasts: '', cakeCutting: '', grandExit: '',
  photographer: '', caterer: '', music: '', florist: '', guests: '', notes: '',
}

const TimeField = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <Input value={value} onChange={onChange} placeholder={placeholder} />
  </div>
)

// Public wedding-day timeline form (Step 16). After the deposit is paid the
// client completes this; the admin then builds the draft wedding-day timeline.
export default function TimelineForm() {
  const [form, setForm] = useState(empty)
  const [submitted, setSubmitted] = useState(false)
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

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

        {submitted ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-9" />
              </div>
              <h1 className="font-display text-2xl font-semibold">Got it — thank you!</h1>
              <p className="max-w-md text-sm text-muted-foreground">
                We'll use these details to build the <span className="font-medium text-foreground">draft timeline</span> for your
                wedding day and share it with you to review on your first 1-hour planning call.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6">
                <h1 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight">
                  <Clock className="size-6 text-primary" /> Wedding-Day Timeline Form
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share the shape of your day. Don't worry about exact times — we'll refine everything together.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }} className="space-y-7">
                <section className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">The basics</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Couple / event name *</Label>
                      <Input required value={form.couple} onChange={set('couple')} placeholder="Sarah & James Whitfield" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Wedding date</Label>
                      <Input type="date" value={form.eventDate} onChange={set('eventDate')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Estimated guest count</Label>
                      <Input type="number" min={0} value={form.guests} onChange={set('guests')} placeholder="80" />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Run of the day</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TimeField label="Getting ready (time & place)" value={form.getReady} onChange={set('getReady')} placeholder="10:00 AM · Casa Marina suite" />
                    <TimeField label="Ceremony (time & place)" value={form.ceremony} onChange={set('ceremony')} placeholder="4:30 PM · beachfront" />
                    <TimeField label="Cocktail hour" value={form.cocktail} onChange={set('cocktail')} placeholder="5:00 PM" />
                    <TimeField label="Reception (time & venue)" value={form.reception} onChange={set('reception')} placeholder="6:00 PM · ballroom" />
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Key moments</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TimeField label="First dance" value={form.firstDance} onChange={set('firstDance')} placeholder="After dinner" />
                    <TimeField label="Parent dances" value={form.parentDances} onChange={set('parentDances')} />
                    <TimeField label="Toasts / speeches" value={form.toasts} onChange={set('toasts')} />
                    <TimeField label="Cake cutting" value={form.cakeCutting} onChange={set('cakeCutting')} />
                    <TimeField label="Grand exit" value={form.grandExit} onChange={set('grandExit')} placeholder="Sparkler send-off" />
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your vendors</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TimeField label="Photographer" value={form.photographer} onChange={set('photographer')} placeholder="Senses At Play" />
                    <TimeField label="Caterer" value={form.caterer} onChange={set('caterer')} />
                    <TimeField label="Music / DJ / band" value={form.music} onChange={set('music')} />
                    <TimeField label="Florist" value={form.florist} onChange={set('florist')} />
                  </div>
                </section>

                <section className="space-y-1.5">
                  <Label>Anything else for the timeline?</Label>
                  <Textarea rows={4} value={form.notes} onChange={set('notes')} placeholder="Special traditions, surprises, must-have photos…" />
                </section>

                <Button type="submit" size="lg" className="w-full justify-center gap-2 text-base shadow-lg shadow-primary/20">
                  Submit timeline details
                  <ArrowRight className="size-4.5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
