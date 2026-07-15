import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowRight, PartyPopper } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const BRANDS = {
  'family-affair': { name: 'Family Affair Key West', logo: '/images/brand/family-affair.png', accent: '#6f9a83' },
  'senses-at-play': { name: 'Senses At Play', logo: '/images/brand/senses-at-play.png', accent: '#c2a15b' },
}

// Public "welcome — set your password" screen for a newly converted client.
// Reached via the secure link in the welcome email the admin sends on convert.
export default function ClientSetup() {
  const { brand } = useParams()
  const cfg = BRANDS[brand === 'senses-at-play' ? 'senses-at-play' : 'family-affair']
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setRole } = useAuth()

  const name = params.get('name') || 'Sarah & James Whitfield'
  const email = params.get('email') || 'sarah.whitfield@example.com'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)

  const tooShort = password.length > 0 && password.length < 8
  const mismatch = confirm.length > 0 && confirm !== password
  const valid = password.length >= 8 && confirm === password

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    setRole('Client')
    toast.success('Password set — welcome to your portal!')
    navigate('/client/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f3ec] px-4 py-10 animate-in fade-in duration-500">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src={cfg.logo} alt={cfg.name} className="h-16 w-16 object-contain" />
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: cfg.accent }}>
            {cfg.name}
          </span>
        </div>

        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${cfg.accent}1f`, color: cfg.accent }}>
                <PartyPopper className="size-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome — you're all set!</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a password to open your {cfg.name} client portal.
                </p>
              </div>
              <div className="w-full rounded-xl bg-muted/50 p-3 text-left text-sm">
                <p className="font-medium">{name}</p>
                <p className="text-muted-foreground">{email}</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Create password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
                  <Input type={show ? 'text' : 'password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters"
                    className="h-12 pr-11 pl-11 text-base" />
                  <button type="button" onClick={() => setShow((v) => !v)}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
                    {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                  </button>
                </div>
                {tooShort && <p className="text-xs text-destructive">Use at least 8 characters.</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Confirm password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
                  <Input type={show ? 'text' : 'password'} required value={confirm}
                    onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter your password"
                    className="h-12 pl-11 text-base" />
                </div>
                {mismatch && <p className="text-xs text-destructive">Passwords don't match.</p>}
              </div>

              <Button type="submit" size="lg" disabled={!valid}
                className="h-12 w-full justify-center gap-2 text-base text-white shadow-lg"
                style={{ backgroundColor: cfg.accent, boxShadow: `0 12px 24px -10px ${cfg.accent}` }}>
                Set password &amp; open my portal
                <ArrowRight className="size-4.5" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          This link is unique to you and expires in 7 days.
        </p>
      </div>
    </div>
  )
}
