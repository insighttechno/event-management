import {
  LifeBuoy, BookOpen, ShieldCheck, Users, ClipboardList, Download,
  ExternalLink, Camera, Shirt, Heart, Printer, Mail, Phone,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { resolveClient } from '@/lib/client-scope'

// Brand-aware helpful resources — guides, downloads and links.
function getResources(cfg) {
  const planning = [
    { icon: BookOpen, title: 'Planning guide', desc: 'A step-by-step guide to the months ahead.', action: 'download' },
    { icon: Users, title: 'Trusted vendor directory', desc: 'Our vetted florists, caterers, DJs and more.', action: 'open' },
    { icon: ShieldCheck, title: 'Wedding insurance', desc: 'Why we recommend it and how to get covered.', action: 'link', to: '/wedding-insurance' },
    { icon: ClipboardList, title: 'Seating & guest-list tips', desc: 'Make the seating chart painless.', action: 'download' },
  ]
  const gallery = [
    { icon: Camera, title: 'How to prepare for your session', desc: 'Get camera-ready and make the most of your time.', action: 'download' },
    { icon: Shirt, title: 'What to wear guide', desc: 'Colours, textures and coordinating outfits.', action: 'download' },
    { icon: Heart, title: 'Choosing your favourites', desc: 'Tips for selecting the images you love most.', action: 'open' },
    { icon: Printer, title: 'Prints & albums', desc: 'Ordering heirloom prints and albums from your gallery.', action: 'open' },
  ]
  return cfg.kind === 'gallery' ? gallery : planning
}

export default function ClientResources() {
  const { user, brand } = useAuth()
  const { cfg } = resolveClient(brand, user?.name)
  const resources = getResources(cfg)

  const handle = (r) => {
    if (r.action === 'download') toast.success(`Downloading “${r.title}”…`)
    else toast.info(`“${r.title}” opens during development.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resources"
        description="Helpful guides, downloads and links to support you along the way."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((r) => (
          <Card key={r.title} className="transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-start gap-4 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><r.icon className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{r.desc}</p>
                <div className="mt-3">
                  {r.action === 'link' ? (
                    <Button asChild size="sm" variant="outline" className="gap-1.5">
                      <a href={r.to} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5" />Open</a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handle(r)}>
                      {r.action === 'download' ? <Download className="size-3.5" /> : <ExternalLink className="size-3.5" />}
                      {r.action === 'download' ? 'Download' : 'Open'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><LifeBuoy className="size-5 text-primary" />Need a hand?</CardTitle>
          <CardDescription>We're always here — reach out any time.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info('Opening your email…')}>
            <Mail className="size-4" />Email your studio
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info('Calling…')}>
            <Phone className="size-4" />(305) 555-0100
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
