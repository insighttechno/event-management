import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Building2, Check, Rocket } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { plans } from '@/data/tenants'
import { tenantsService } from '@/services/tenants'
import { useTenant } from '@/hooks/use-tenant'

const steps = ['Company details', 'Choose a plan', 'Workspace ready']

function initialsFrom(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function subdomainFrom(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24)
}

export default function CompanySignup() {
  const navigate = useNavigate()
  const { switchTenant } = useTenant()
  const [step, setStep] = useState(0)
  const [company, setCompany] = useState({ name: '', tagline: '', email: '' })
  const [planId, setPlanId] = useState('starter')
  const [createdTenant, setCreatedTenant] = useState(null)

  const canContinue = company.name.trim().length > 1 && company.email.trim().length > 3

  const createWorkspace = () => {
    const tenant = tenantsService.create({
      name: company.name.trim(),
      tagline: company.tagline.trim(),
      contactEmail: company.email.trim(),
      initials: initialsFrom(company.name),
      subdomain: subdomainFrom(company.name),
      phone: '',
      address: '',
      plan: planId,
    })
    setCreatedTenant(tenant)
    setStep(2)
    toast.success(`Workspace "${tenant.name}" created.`)
  }

  const enterWorkspace = () => {
    switchTenant(createdTenant.id)
    navigate('/admin/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <p className="font-display text-2xl font-semibold">Event CRM Cloud</p>
          <p className="text-sm text-muted-foreground">
            Start a new workspace for your event business
          </p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                  index < step
                    ? 'bg-primary text-primary-foreground'
                    : index === step
                      ? 'border-2 border-primary text-primary'
                      : 'border border-border text-muted-foreground'
                )}
              >
                {index < step ? <Check className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden text-sm sm:inline',
                  index === step ? 'font-medium' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
              {index < steps.length - 1 && (
                <span className="mx-1 h-px w-6 bg-border sm:w-10" />
              )}
            </div>
          ))}
        </div>

        <Card>
          {step === 0 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5 text-muted-foreground" />
                  Tell us about your company
                </CardTitle>
                <CardDescription>
                  This becomes your workspace — your team, clients and data live here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input
                    id="company-name"
                    value={company.name}
                    onChange={(e) => setCompany((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Sunset Soirées Co."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company-tagline">Tagline (optional)</Label>
                  <Input
                    id="company-tagline"
                    value={company.tagline}
                    onChange={(e) => setCompany((p) => ({ ...p, tagline: e.target.value }))}
                    placeholder="e.g. Destination Weddings"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company-email">Work email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={company.email}
                    onChange={(e) => setCompany((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@company.com"
                  />
                </div>
                {company.name.trim() && (
                  <p className="text-xs text-muted-foreground">
                    Your workspace URL: <span className="font-medium">{subdomainFrom(company.name) || 'yourcompany'}.eventcrm.app</span>
                  </p>
                )}
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" asChild>
                    <Link to="/admin/dashboard">
                      <ArrowLeft className="size-4" />
                      Back to portal
                    </Link>
                  </Button>
                  <Button disabled={!canContinue} onClick={() => setStep(1)} className="gap-1.5">
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Choose a plan</CardTitle>
                <CardDescription>
                  Every plan starts with a 14-day free trial. (Demo — no real billing.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {plans.map((plan) => {
                    const selected = plan.id === planId
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setPlanId(plan.id)}
                        className={cn(
                          'flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors',
                          selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
                        )}
                      >
                        <span className="flex w-full items-center justify-between">
                          <span className="text-sm font-semibold">{plan.name}</span>
                          {selected && <Check className="size-4 text-primary" />}
                        </span>
                        <span>
                          <span className="font-display text-2xl font-semibold">${plan.price}</span>
                          <span className="text-xs text-muted-foreground"> /mo</span>
                        </span>
                        <span className="text-xs text-muted-foreground">{plan.description}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(0)} className="gap-1.5">
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Button onClick={createWorkspace} className="gap-1.5">
                    <Rocket className="size-4" />
                    Create workspace
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && createdTenant && (
            <>
              <CardHeader className="items-center text-center">
                <span
                  className="mb-2 flex size-14 items-center justify-center self-center rounded-2xl text-lg font-bold text-white"
                  style={{ backgroundColor: createdTenant.brandColor }}
                >
                  {createdTenant.initials}
                </span>
                <CardTitle>{createdTenant.name} is ready!</CardTitle>
                <CardDescription>
                  Your workspace has been created on the{' '}
                  {plans.find((p) => p.id === createdTenant.plan)?.name} plan.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge variant="secondary">{createdTenant.subdomain}.eventcrm.app</Badge>
                  <Badge variant="outline">14-day trial</Badge>
                </div>
                <p className="max-w-sm text-center text-sm text-muted-foreground">
                  Invite your team, add your first lead and customize your branding from
                  Settings → Workspace.
                </p>
                <Button onClick={enterWorkspace} className="gap-1.5">
                  Go to my workspace
                  <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
