// Generic tenant-scoped, in-memory collection.
// Today the "database" is the seed arrays in src/data/*. When a real backend
// exists, replace the bodies of these functions with fetch() calls — the pages
// never touch raw data and will not need to change.
import { getCurrentTenantId } from './tenant-store'
import { nextSequentialId } from '@/lib/utils'

export function createCollection(seed, idPrefix) {
  let items = [...seed]

  return {
    list() {
      return items.filter((item) => item.tenantId === getCurrentTenantId())
    },
    get(id) {
      return (
        items.find(
          (item) => item.id === id && item.tenantId === getCurrentTenantId()
        ) ?? null
      )
    },
    create(data) {
      const item = {
        ...data,
        id: nextSequentialId(items, idPrefix),
        tenantId: getCurrentTenantId(),
      }
      items = [item, ...items]
      return item
    },
    update(id, patch) {
      items = items.map((item) =>
        item.id === id && item.tenantId === getCurrentTenantId()
          ? { ...item, ...patch }
          : item
      )
      return this.get(id)
    },
    remove(id) {
      items = items.filter(
        (item) => !(item.id === id && item.tenantId === getCurrentTenantId())
      )
    },
  }
}
