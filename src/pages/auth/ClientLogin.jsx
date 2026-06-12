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
import { Separator } from '@/components/ui/separator'
import { GoogleIcon, AppleIcon } from '@/components/common/BrandIcons'

export default function ClientLogin() {
  const { role: activeRole, setRole } = useAuth()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(demoUsers.Client.email)
  const [password, setPassword] = useState('demo-password')
  const [remember, setRemember] = useState(true)

  useEffect(() => {
    if (activeRole === 'Client') {
      navigate('/client/dashboard', { replace: true })
    }
  }, [activeRole, navigate])

  const handleSubmit = (event) => {
    event.preventDefault()
    setRole('Client')
    toast.success(`Welcome back, ${demoUsers.Client.name.split(' ')[0]}!`)
    navigate('/client/dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign in to track your event, timeline and gallery.
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
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
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

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs font-medium tracking-wide text-muted-foreground">
          OR CONTINUE WITH
        </span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => toast.info('Google sign-in is not available in this preview.')}
        >
          <GoogleIcon />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => toast.info('Apple sign-in is not available in this preview.')}
        >
          <AppleIcon />
          Apple
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&rsquo;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
