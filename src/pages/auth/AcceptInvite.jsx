import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const GOLD = '#c2a15b'

// Public "accept invitation" screen. The team member reaches this via the
// secure link in their invite email, sets a password, and enters the portal.
export default function AcceptInvite() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setRole } = useAuth()

  const name = params.get('name') || 'Marco Diaz'
  const email = params.get('email') || 'marco@familyaffairkeywest.com'
  const role = params.get('role') || 'Team Member'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)

  const tooShort = password.length > 0 && password.length < 8
  const mismatch = confirm.length > 0 && confirm !== password
  const valid = password.length >= 8 && confirm === password

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    setRole(role === 'Administrator' ? 'Administrator' : 'Team Member')
    toast.success(`Welcome to the team, ${name.split(' ')[0]}!`)
    navigate('/admin/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f3ec] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-5">
            <img src="/images/brand/family-affair.png" alt="Family Affair Key West" className="h-14 w-14 object-contain" />
            <span className="h-11 w-px bg-neutral-300" />
            <img src="/images/brand/senses-at-play.png" alt="Senses at Play" className="h-14 w-14 object-contain" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: GOLD }}>
            Family Affair · Senses At Play
          </p>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserPlus className="size-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight">You've been invited</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Set a password to join the team and enter the admin portal.
                </p>
              </div>
              <div className="w-full rounded-xl bg-muted/50 p-3 text-left text-sm">
                <p className="font-medium">{name}</p>
                <p className="text-muted-foreground">{email}</p>
                <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold" style={{ borderColor: 'rgba(194,161,91,0.5)', color: GOLD }}>
                  <ShieldCheck className="size-3" />{role}
                </span>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Create password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={show ? 'text' : 'password'} required value={password}
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
                  <Input
                    type={show ? 'text' : 'password'} required value={confirm}
                    onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter your password"
                    className="h-12 pl-11 text-base" />
                </div>
                {mismatch && <p className="text-xs text-destructive">Passwords don't match.</p>}
              </div>

              <Button type="submit" size="lg" disabled={!valid}
                className="h-12 w-full justify-center gap-2 text-base shadow-lg shadow-primary/20">
                Set password &amp; enter portal
                <ArrowRight className="size-4.5" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          This invitation link is unique to you and expires in 7 days.
        </p>
      </div>
    </div>
  )
}
