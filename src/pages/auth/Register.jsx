import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { GoogleIcon, AppleIcon } from '@/components/common/BrandIcons'

export default function Register() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!agreed) {
      toast.error('Please agree to the Terms of Service and Privacy Policy.')
      return
    }
    toast.success('Account created! Please sign in to continue.')
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Create your account
        </h2>
        <p className="text-sm text-muted-foreground">
          Set up your client portal access in just a few seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              required
              placeholder="Jane Smith"
              className="h-11 pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="h-11 pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Create a password"
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

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                required
                placeholder="Re-enter password"
                className="h-11 pr-10 pl-9"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={setAgreed}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
            I agree to the{' '}
            <span className="font-medium text-primary hover:underline">Terms of Service</span> and{' '}
            <span className="font-medium text-primary hover:underline">Privacy Policy</span>.
          </Label>
        </div>

        <Button type="submit" size="lg" className="w-full justify-center gap-2">
          Create account
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
          onClick={() => toast.info('Google sign-up is not available in this preview.')}
        >
          <GoogleIcon />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => toast.info('Apple sign-up is not available in this preview.')}
        >
          <AppleIcon />
          Apple
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
