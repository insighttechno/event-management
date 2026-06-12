// Tenant (workspace) management — used by the workspace switcher, Settings,
// company signup and the Super Admin console.
import { tenants as seedTenants, plans } from '@/data/tenants'

let tenants = [...seedTenants]

export const tenantsService = {
  list() {
    return tenants
  },
  get(id) {
    return tenants.find((tenant) => tenant.id === id) ?? null
  },
  create(data) {
    const max = tenants.reduce(
      (acc, tenant) => Math.max(acc, parseInt(tenant.id.split('-')[1], 10) || 0),
      0
    )
    const tenant = {
      brandColor: 'oklch(0.65 0.16 35)',
      plan: 'starter',
      status: 'Trial',
      tagline: '',
      seeded: true,
      createdAt: new Date().toISOString().slice(0, 10),
      ...data,
      id: `T-${max + 1}`,
    }
    tenants = [...tenants, tenant]
    return tenant
  },
  update(id, patch) {
    tenants = tenants.map((tenant) =>
      tenant.id === id ? { ...tenant, ...patch } : tenant
    )
    return this.get(id)
  },
  planFor(tenant) {
    return plans.find((plan) => plan.id === tenant?.plan) ?? plans[0]
  },
}
