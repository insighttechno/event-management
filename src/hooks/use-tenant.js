import { useContext } from 'react'
import { TenantContext } from '@/context/tenant-context'

export function useTenant() {
  return useContext(TenantContext)
}
