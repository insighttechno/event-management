import { useState } from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const GOLD = '#c2a15b'

const empty = {
  name: '', partner: '', email: '', phone: '',
  service: 'Wedding Planning (Family Affair)', eventType: '', eventDate: '',
  guests: '', location: '', budget: '', message: '',
}

// Public, branded client information form. In production this is a per-client
// link; on submit the data auto-populates the client profile, event details and
// the contract generation module — no duplicate data entry.
export default function IntakeForm() {
  const [form, setForm] = useState(empty)
  const [submitted, setSubmitted] = useState(false)
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#f6f3ec] px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        {/* Brand header */}
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
              <h1 className="font-display text-2xl font-semibold">Thank you, {form.name.split(' ')[0] || 'there'}!</h1>
              <p className="max-w-md text-sm text-muted-foreground">
                Your details are in. We'll be in touch shortly. This information now flows straight into your
                profile, event details and contract — so you never have to enter it twice.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6">
                <h1 className="font-display text-2xl font-semibold tracking-tight">Client Information Form</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tell us about you and your event. It only takes a couple of minutes.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-7">
                {/* Your details */}
                <section className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your details</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Your name *</Label>
                      <Input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Sarah Whitfield" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Partner's name</Label>
                      <Input value={form.partner} onChange={(e) => set('partner', e.target.value)} placeholder="James Whitfield" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email *</Label>
                      <Input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(305) 555-0142" />
                    </div>
                  </div>
                </section>

                {/* Your event */}
                <section className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your event</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>What are you looking for?</Label>
                      <Select value={form.service} onValueChange={(v) => set('service', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Wedding Planning (Family Affair)">Wedding Planning (Family Affair)</SelectItem>
                          <SelectItem value="Photography (Senses At Play)">Photography (Senses At Play)</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Event type</Label>
                      <Input value={form.eventType} onChange={(e) => set('eventType', e.target.value)} placeholder="Wedding / Vow renewal / Shoot" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Event date (or approx.)</Label>
                      <Input type="date" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Estimated guests</Label>
                      <Input type="number" min={0} value={form.guests} onChange={(e) => set('guests', e.target.value)} placeholder="80" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Location / venue (if known)</Label>
                      <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Smathers Beach, Key West" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Budget range</Label>
                      <Select value={form.budget} onValueChange={(v) => set('budget', v)}>
                        <SelectTrigger><SelectValue placeholder="Select a range" /></SelectTrigger>
                        <SelectContent>
                          {['Under $10k', '$10k – $25k', '$25k – $40k', '$40k – $60k', '$60k+'].map((b) => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                {/* Anything else */}
                <section className="space-y-1.5">
                  <Label>Anything else we should know?</Label>
                  <Textarea rows={4} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Your vision, must-haves, questions…" />
                </section>

                <Button type="submit" size="lg" className="w-full justify-center gap-2 text-base shadow-lg shadow-primary/20">
                  Submit my details
                  <ArrowRight className="size-4.5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your information is kept private and used only to plan your event.
        </p>
      </div>
    </div>
  )
}
