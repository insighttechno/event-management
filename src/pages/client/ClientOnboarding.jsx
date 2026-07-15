import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, ShieldCheck, CheckCircle2, Clock, Sparkles, HeartHandshake,
  CreditCard, Camera, Images, ClipboardList, ChevronDown, ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { StatStrip } from '@/components/common/StatStrip'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/use-auth'
import { resolveClient } from '@/lib/client-scope'

// Brand-aware onboarding content — the five/six emails the studio currently
// sends manually, consolidated into structured in-portal chapters (spec §5.10).
function getChapters(cfg) {
  const planning = [
    { icon: HeartHandshake, title: 'Welcome to the family', points: [
      `We're so excited to plan your ${cfg.eventWord} with you.`,
      'This portal is your single home for everything — timeline, documents, payments and messages.',
      'Bookmark it and check in whenever you like; nothing gets lost here.',
    ] },
    { icon: ClipboardList, title: 'How your planning journey works', points: [
      'Your assigned package drives your call schedule and reminders.',
      'We begin with a 1-hour planning call, then a series of 30-minute check-ins.',
      'Everything you approve here flows straight to our team.',
    ] },
    { icon: Sparkles, title: 'What to expect from us', points: [
      'Clear next steps at every stage — you will never wonder “what now?”.',
      'Vendor introductions and a custom wedding-day timeline.',
      'On-site coordination so you can be fully present on the day.',
    ] },
    { icon: CreditCard, title: 'Payments & policies', points: [
      'Your deposit secures the date; the balance is due 60 days before the event.',
      'We accept electronic check, mailed check, Zelle and Venmo.',
      'Wedding insurance guidance is included — see Resources.',
    ] },
  ]
  const gallery = [
    { icon: HeartHandshake, title: 'Welcome to Senses At Play', points: [
      `We can't wait to capture your ${cfg.eventNoun}.`,
      'This portal is where your gallery, invoices and documents live.',
      'You will be notified here the moment your photos are ready.',
    ] },
    { icon: Camera, title: 'How your session & gallery works', points: [
      'We confirm your session details and shot preferences before the day.',
      'After the shoot, your images move into editing.',
      'Your finished gallery is delivered right here for viewing and download.',
    ] },
    { icon: Images, title: 'What to expect', points: [
      'A beautifully edited online gallery with high-resolution downloads.',
      'A print release so you can order prints and albums.',
      'Help choosing your favourites whenever you need it.',
    ] },
    { icon: CreditCard, title: 'Payments & policies', points: [
      'A deposit secures your session date; the balance follows your package schedule.',
      'We accept electronic check, mailed check, Zelle and Venmo.',
      'Turnaround times for editing are shared with your package.',
    ] },
  ]
  return cfg.kind === 'gallery' ? gallery : planning
}

const FAQ = [
  { q: 'How do I reach my planner between calls?', a: 'Use the Meetings tab to book a consultation, or your unlimited support once your support window opens. We reply through the portal so nothing gets lost in email.' },
  { q: 'Where do I sign documents and pay?', a: 'Signed contracts live under Contracts, and every invoice with a secure pay link lives under Invoices. Both update in real time.' },
  { q: 'Can I change details after I acknowledge?', a: 'Absolutely. Acknowledging simply confirms you have read the welcome pack — you can revisit any of it here at any time.' },
]

function FaqItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border bg-card">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium">
        {item.q}
        <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</p>}
    </div>
  )
}

export default function ClientOnboarding() {
  const { user, brand } = useAuth()
  const { cfg, me } = resolveClient(brand, user?.name)
  const chapters = getChapters(cfg)

  const [acknowledged, setAcknowledged] = useState(me?.onboarding === 'Acknowledged')
  const [checked, setChecked] = useState(false)

  const confirm = () => {
    setAcknowledged(true)
    toast.success('Thank you — your acknowledgement has been recorded.', {
      description: 'Your welcome pack stays here if you ever want to revisit it.',
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Welcome & onboarding"
        description="Everything you need to know to get started — read through, then confirm below."
      />

      <StatStrip items={[
        { label: 'Chapters', value: chapters.length, icon: BookOpen, accent: 'primary' },
        { label: 'Estimated read', value: '5 min', icon: Clock, accent: 'navy' },
        { label: 'Status', value: acknowledged ? 'Acknowledged' : 'Pending', icon: ShieldCheck, accent: acknowledged ? 'secondary' : 'accent' },
      ]} />

      <div className="grid gap-4 md:grid-cols-2">
        {chapters.map((ch, i) => (
          <Card key={ch.title}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><ch.icon className="size-5" /></span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Chapter {i + 1}</p>
                  <CardTitle className="text-base">{ch.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {ch.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary/70" />{p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frequently asked</CardTitle>
          <CardDescription>Quick answers to the questions we hear most</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {FAQ.map((item) => <FaqItem key={item.q} item={item} />)}
        </CardContent>
      </Card>

      {/* Acknowledgement — stored as proof the client has read the welcome pack */}
      {acknowledged ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="size-5" />You've completed your onboarding — thank you!
            </p>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/client/dashboard">Back to dashboard<ArrowRight className="size-3.5" /></Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Confirm your acknowledgement</CardTitle>
            <CardDescription>Please confirm you've read and understood the information above.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-sm">
              <Checkbox checked={checked} onCheckedChange={(v) => setChecked(!!v)} className="mt-0.5" />
              <span>I have read and understood all the information provided in my welcome pack.</span>
            </label>
            <Button disabled={!checked} onClick={confirm} className="gap-1.5">
              <ShieldCheck className="size-4" />Confirm acknowledgement
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
