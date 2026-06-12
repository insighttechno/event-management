import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
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

  return (
    <div className="space-y-5">
      <div className="space-y-1.5 text-center sm:text-left">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign in to your workspace to manage events, leads, vendors and more.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-11 pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/admin/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-11 pr-10 pl-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" checked={remember} onCheckedChange={setRemember} />
          <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
            Remember me for 30 days
          </Label>
        </div>

        <Button type="submit" size="lg" className="w-full justify-center gap-2">
          Sign in
          <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New team member? Ask your administrator to add you under{' '}
        <span className="font-medium text-foreground">Team &amp; Settings</span>.
      </p>

      <p className="text-center text-xs text-muted-foreground">
        Looking for the client portal?{' '}
        <Link to="/" className="font-medium text-primary hover:underline">
          Go to client sign in
        </Link>
      </p>
    </div>
  )
}
