import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { superAdminAuth } from '@/services/superadmin'
import { consoleAccent } from './console-theme'

export default function SuperAdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  if (superAdminAuth.isLoggedIn()) {
    return <Navigate to="/superadmin" replace />
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    // Demo auth — accepts any credentials. Real SSO/MFA comes with the backend.
    setTimeout(() => {
      superAdminAuth.login()
      toast.success('Welcome back to the Platform Console.')
      navigate('/superadmin')
    }, 600)
  }

  return (
    <div
      className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 text-foreground"
      style={consoleAccent}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-[oklch(0.62_0.21_295)]/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 size-96 rounded-full bg-[oklch(0.55_0.18_250)]/15 blur-3xl" />
        <div className="absolute -right-24 top-1/3 size-80 rounded-full bg-[oklch(0.6_0.2_330)]/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.62_0.21_295)] to-[oklch(0.55_0.2_330)] shadow-lg shadow-[oklch(0.62_0.21_295)]/30">
            <ShieldCheck className="size-7 text-white" />
          </span>
          <h1 className="font-display text-2xl font-semibold">Platform Console</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Event CRM Cloud · Super Admin access only
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sa-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sa-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@platform.com"
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sa-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sa-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!email.trim() || !password.trim() || loading}
              className="mt-1 w-full gap-1.5 bg-gradient-to-r from-[oklch(0.62_0.21_295)] to-[oklch(0.55_0.2_330)] text-white shadow-lg shadow-[oklch(0.62_0.21_295)]/25 hover:opacity-90"
            >
              {loading ? 'Signing in…' : 'Sign in to Console'}
            </Button>
          </form>

          <p className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
            <Sparkles className="size-3.5 shrink-0" />
            Demo — any email & password works. Real SSO/MFA comes with the backend.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Link to="/admin/dashboard">
              <ArrowLeft className="size-4" />
              Back to workspace portal
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
