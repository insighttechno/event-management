import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, MailCheck, Heart, Camera,
  CalendarHeart, FileText, CreditCard, Images, Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { demoUsers } from '@/data/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const BRANDS = {
  'family-affair': {
    name: 'Family Affair Key West',
    logo: '/images/brand/family-affair.png',
    icon: Heart,
    eyebrow: 'Weddings & Event Planning',
    headline: 'Your celebration, beautifully in hand.',
    sub: 'Sign in to see your timeline, contracts, payments and every detail of your big day.',
    accent: '#6f9a83',
    tint: 'rgba(52,80,66',
    images: ['/images/auth/slider/slide1.jpg', '/images/auth/slider/slide4.jpg'],
    features: [
      { icon: CalendarHeart, label: 'Timeline' },
      { icon: FileText, label: 'Contracts' },
      { icon: CreditCard, label: 'Payments' },
      { icon: Images, label: 'Gallery' },
    ],
  },
  'senses-at-play': {
    name: 'Senses At Play',
    logo: '/images/brand/senses-at-play.png',
    icon: Camera,
    eyebrow: 'Photography',
    headline: 'Your moments, captured & ready.',
    sub: 'Sign in to view your galleries, downloads, invoices and session details — all in one place.',
    accent: '#c2a15b',
    tint: 'rgba(64,52,30',
    images: ['/images/auth/slider/sap1.jpg', '/images/auth/slider/sap2.jpg'],
    features: [
      { icon: Images, label: 'Galleries' },
      { icon: Download, label: 'Downloads' },
      { icon: CreditCard, label: 'Invoices' },
      { icon: Camera, label: 'Sessions' },
    ],
  },
}

export default function ClientLogin() {
  const { brand } = useParams()
  const brandKey = brand === 'senses-at-play' ? 'senses-at-play' : 'family-affair'
  const cfg = BRANDS[brandKey]
  const { role: activeRole, setRole, setBrand } = useAuth()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(demoUsers.Client.email)
  const [password, setPassword] = useState('demo-password')
  const [remember, setRemember] = useState(true)
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState('login')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const backToLogin = () => { setMode('login'); setForgotSent(false) }

  // Landing on a branded login URL locks in that brand — even for an already
  // signed-in client who gets redirected straight to their dashboard.
  useEffect(() => {
    setBrand(brandKey)
    if (activeRole === 'Client') navigate('/client/dashboard', { replace: true })
  }, [brandKey, activeRole, navigate, setBrand])

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % cfg.images.length), 6000)
    return () => clearInterval(id)
  }, [cfg.images.length])

  const handleSubmit = (event) => {
    event.preventDefault()
    setBrand(brandKey)
    setRole('Client')
    toast.success('Welcome back!')
    navigate('/client/dashboard')
  }

  const Icon = cfg.icon

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f3ec]">
      {/* Left — branded imagery */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        {cfg.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            className={cn(
              'absolute inset-0 size-full object-cover transition-all duration-[1600ms] ease-in-out',
              i === active ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
            )}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `linear-gradient(to top, ${cfg.tint},0.92) 0%, ${cfg.tint},0.4) 46%, ${cfg.tint},0.05) 72%)` }}
        />
        <div className="pointer-events-none absolute inset-5 rounded-[1.75rem] border" style={{ borderColor: 'rgba(255,255,255,0.25)' }} />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white xl:p-14">
          <div className="inline-flex w-fit items-center gap-3 rounded-2xl bg-white/95 py-2.5 pr-5 pl-3 shadow-xl backdrop-blur animate-in fade-in slide-in-from-top-3 duration-700">
            <img src={cfg.logo} alt={cfg.name} className="h-14 w-14 object-contain" />
            <div className="leading-tight">
              <p className="font-display text-[15px] font-semibold text-neutral-800">{cfg.name}</p>
              <p className="text-[11px] tracking-wide text-neutral-500">Client Portal</p>
            </div>
          </div>

          <div className="max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.24em] text-white uppercase">
              <Icon className="size-4" style={{ color: cfg.accent }} />
              {cfg.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.15] font-semibold text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] xl:text-[3.1rem]">
              {cfg.headline}
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-white/90 drop-shadow">{cfg.sub}</p>

            {/* Feature chips — fill the space + show what's inside */}
            <div className="mt-7 flex flex-wrap gap-2">
              {cfg.features.map((f) => (
                <span key={f.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                  <f.icon className="size-3.5" style={{ color: cfg.accent }} />
                  {f.label}
                </span>
              ))}
            </div>

            <div className="mt-6 flex gap-1.5">
              {cfg.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={cn('h-1.5 rounded-full transition-all duration-500', i === active ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70')}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — sign-in */}
      <div className="flex h-screen w-full flex-col items-center justify-center overflow-y-auto px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-7 flex flex-col items-center gap-3 text-center">
            <img src={cfg.logo} alt={cfg.name} className="h-24 w-24 object-contain" />
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: cfg.accent }}>
              {cfg.name}
            </span>
          </div>

          {mode === 'forgot' ? (
            <div className="space-y-5">
              <button type="button" onClick={backToLogin}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="size-4" />Back to sign in
              </button>
              {forgotSent ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${cfg.accent}1f`, color: cfg.accent }}><MailCheck className="size-7" /></div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold tracking-tight">Check your email</h2>
                    <p className="mt-1 text-sm text-muted-foreground">We've sent a reset link to <span className="font-medium text-foreground">{forgotEmail}</span>.</p>
                  </div>
                  <Button size="lg" onClick={backToLogin} className="h-12 w-full justify-center gap-2 text-base text-white" style={{ backgroundColor: cfg.accent }}>Back to sign in</Button>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5 text-center">
                    <h2 className="font-display text-3xl font-semibold tracking-tight">Forgot your password?</h2>
                    <p className="text-[15px] text-muted-foreground">Enter your email and we'll send a reset link.</p>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); setForgotSent(true) }} className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[13px] font-medium">Email address</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="you@example.com" className="h-12 pl-11 text-base" />
                      </div>
                    </div>
                    <Button type="submit" size="lg" className="h-12 w-full justify-center gap-2 text-base text-white shadow-lg"
                      style={{ backgroundColor: cfg.accent, boxShadow: `0 12px 24px -10px ${cfg.accent}` }}>
                      Send reset link <ArrowRight className="size-4.5" />
                    </Button>
                  </form>
                </>
              )}
            </div>
          ) : (
          <>
          <div className="space-y-1.5 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-[15px] text-muted-foreground">Sign in to your client portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                <button type="button" onClick={() => setMode('forgot')} className="text-xs font-medium hover:underline" style={{ color: cfg.accent }}>Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-12 pr-11 pl-11 text-base" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
                  {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={setRemember} />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Remember me</Label>
            </div>

            <Button type="submit" size="lg"
              className="h-12 w-full justify-center gap-2 text-base text-white shadow-lg"
              style={{ backgroundColor: cfg.accent, boxShadow: `0 12px 24px -10px ${cfg.accent}` }}>
              Sign in
              <ArrowRight className="size-4.5" />
            </Button>
          </form>

          {/* Little reassurance row — fills the space nicely */}
          <div className="mt-7 grid grid-cols-3 gap-2 border-t border-border pt-5">
            {cfg.features.slice(0, 3).map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-1.5 text-center">
                <div className="flex size-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${cfg.accent}1f`, color: cfg.accent }}>
                  <f.icon className="size-4" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">{f.label}</span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Access is set up by your planner. Trouble signing in? Just reply to your welcome email.
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
