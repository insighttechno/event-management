import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { ArrowLeft, Mail, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPassword() {
  const { signInPath = '/' } = useOutletContext() ?? {}
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      <Link
        to={signInPath}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Link>

      {submitted ? (
        <div className="space-y-6 text-center sm:text-left">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:mx-0">
            <MailCheck className="size-7" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Check your email
            </h2>
            <p className="text-sm text-muted-foreground">
              We&rsquo;ve sent a password reset link to{' '}
              <span className="font-medium text-foreground">{email}</span>. Follow the link to
              choose a new password.
            </p>
          </div>
          <Button asChild size="lg" className="w-full justify-center gap-2">
            <Link to={signInPath}>Back to sign in</Link>
          </Button>
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Didn&rsquo;t get the email?{' '}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="font-medium text-primary hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Forgot your password?
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter the email associated with your account and we&rsquo;ll send you a link to
              reset your password.
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

            <Button type="submit" size="lg" className="w-full justify-center gap-2">
              Send reset link
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
