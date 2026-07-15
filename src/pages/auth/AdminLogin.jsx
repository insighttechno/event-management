import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, MailCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { demoUsers } from '@/data/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

// Role is resolved from the email — no role picker needed (demo auth, no backend).
function resolveRole(email) {
  const normalized = email.trim().toLowerCase()
  const match = Object.entries(demoUsers).find(
    ([role, user]) => role !== 'Client' && user.email.toLowerCase() === normalized
  )
  return match ? match[0] : 'Team Member'
}

export default function AdminLogin() {
  const { role: activeRole, setRole } = useAuth()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(demoUsers.Administrator.email)
  const [password, setPassword] = useState('demo-password')
  const [remember, setRemember] = useState(true)

  const [mode, setMode] = useState('login')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const backToLogin = () => { setMode('login'); setForgotSent(false) }

  useEffect(() => {
    if (activeRole === 'Administrator' || activeRole === 'Team Member') {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [activeRole, navigate])

  const handleSubmit = (event) => {
    event.preventDefault()
    const role = resolveRole(email)
    setRole(role)
    toast.success(`Welcome back, ${demoUsers[role].name.split(' ')[0]}!`)
    navigate('/admin/dashboard')
  }

  // ---------- Forgot password (inline, same page) ----------
  if (mode === 'forgot') {
    return (
      <div className="space-y-5">
        <button type="button" onClick={backToLogin}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" />Back to sign in
        </button>

        {forgotSent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MailCheck className="size-7" /></div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">Check your email</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We've sent a reset link to <span className="font-medium text-foreground">{forgotEmail}</span>.
              </p>
            </div>
            <Button size="lg" className="h-12 w-full justify-center gap-2 text-base" onClick={backToLogin}>Back to sign in</Button>
          </div>
        ) : (
          <>
            <div className="space-y-1 text-center">
              <h2 className="font-display text-[26px] font-semibold tracking-tight">Forgot your password?</h2>
              <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setForgotSent(true) }} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[13px] font-medium">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com" className="h-12 pl-11 text-base" />
                </div>
              </div>
              <Button type="submit" size="lg" className="h-12 w-full justify-center gap-2 text-base shadow-lg shadow-primary/20">
                Send reset link <ArrowRight className="size-4.5" />
              </Button>
            </form>
          </>
        )}
      </div>
    )
  }

  // ---------- Login ----------
  return (
    <div className="space-y-5">
      <div className="space-y-1 text-center">
        <h2 className="font-display text-[26px] font-semibold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Sign in to manage Family Affair Key West &amp; Senses At Play.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] font-medium">Email address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className="h-12 pl-11 text-base" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[13px] font-medium">Password</Label>
            <button type="button" onClick={() => setMode('forgot')} className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type={showPassword ? 'text' : 'password'} required value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-12 pr-11 pl-11 text-base" />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" checked={remember} onCheckedChange={setRemember} />
          <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Remember me</Label>
        </div>

        <Button type="submit" size="lg" className="h-12 w-full justify-center gap-2 text-base shadow-lg shadow-primary/20">
          Sign in <ArrowRight className="size-4.5" />
        </Button>
      </form>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        Secure sign-in for administrators &amp; team members.
      </p>
    </div>
  )
}
