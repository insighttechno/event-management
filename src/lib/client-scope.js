import { clients } from '@/data/clients'
import { events } from '@/data/events'
import { getBrandConfig } from '@/data/brand-config'

// Resolve the logged-in client's own records for the active brand. In the demo
// the auth user is fixed, so we match by name within the brand, then fall back to
// the first client of that brand — this is what makes the Senses At Play portal
// show a photography client (Emily Carter) vs Family Affair's wedding client.
export function resolveClient(brand, userName) {
  const cfg = getBrandConfig(brand)
  const me =
    clients.find((c) => c.name === userName && c.brand === cfg.short) ??
    clients.find((c) => c.brand === cfg.short) ??
    clients[0]
  const event = events.find((e) => e.client === me?.name) ?? events[0]
  return { cfg, me, event }
}
