import { useEffect, useState } from 'react'
import { TenantContext } from '@/context/tenant-context'
import { tenantsService } from '@/services/tenants'
import {
  getCurrentTenantId,
  setCurrentTenantId,
  getSaasDemoEnabled,
  setSaasDemoEnabled,
} from '@/services/tenant-store'

export function TenantProvider({ children }) {
  const [tenantId, setTenantId] = useState(getCurrentTenantId)
  const [saasDemo, setSaasDemoState] = useState(getSaasDemoEnabled)
  // Bumped after tenant edits (branding, plan) so consumers re-render.
  const [version, setVersion] = useState(0)

  const tenant = tenantsService.get(tenantId) ?? tenantsService.list()[0]

  // Apply per-workspace branding: accent color + document title.
  useEffect(() => {
    const root = document.documentElement
    const color = tenant?.brandColor
    const vars = ['--primary', '--ring', '--chart-1', '--sidebar-primary']
    if (color) {
      vars.forEach((name) => root.style.setProperty(name, color))
    }
    if (tenant) {
      document.title = `${tenant.name} | Business Portal`
    }
    return () => vars.forEach((name) => root.style.removeProperty(name))
  }, [tenant])

  const switchTenant = (id) => {
    setCurrentTenantId(id)
    setTenantId(id)
  }

  const updateTenant = (patch) => {
    tenantsService.update(tenant.id, patch)
    setVersion((v) => v + 1)
  }

  const setSaasDemo = (enabled) => {
    setSaasDemoEnabled(enabled)
    setSaasDemoState(enabled)
  }

  const value = {
    tenant,
    tenants: tenantsService.list(),
    plan: tenantsService.planFor(tenant),
    switchTenant,
    updateTenant,
    saasDemo,
    setSaasDemo,
    version,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}
