// Holds the active workspace (tenant). Every service reads this to scope data.
// When a real backend exists, the tenant comes from the logged-in user's session
// or the subdomain — only this file changes.
import { tenants } from '@/data/tenants'

const TENANT_KEY = 'fa-portal-tenant'
const DEMO_KEY = 'fa-portal-saas-demo'

let currentTenantId = localStorage.getItem(TENANT_KEY) ?? tenants[0].id
if (!tenants.some((tenant) => tenant.id === currentTenantId)) {
  currentTenantId = tenants[0].id
}

export function getCurrentTenantId() {
  return currentTenantId
}

export function setCurrentTenantId(id) {
  currentTenantId = id
  localStorage.setItem(TENANT_KEY, id)
}

// SaaS demo mode: when off, all SaaS-only UI (workspace switcher, billing,
// super admin) is hidden and the portal looks exactly like the client-scope build.
export function getSaasDemoEnabled() {
  return localStorage.getItem(DEMO_KEY) !== 'off'
}

export function setSaasDemoEnabled(enabled) {
  localStorage.setItem(DEMO_KEY, enabled ? 'on' : 'off')
}
