import { useEffect, useState } from 'react'
import { AuthContext } from '@/context/auth-context'
import { demoUsers } from '@/data/users'

const ROLE_KEY = 'fa-portal-role'
const PROFILE_KEY = 'fa-portal-profile-overrides'
const BRAND_KEY = 'fa-portal-brand'

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter((part) => /^[a-z]/i.test(part))
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join('')
}

export function AuthProvider({ children }) {
  const [role, setRoleState] = useState(() => localStorage.getItem(ROLE_KEY))
  const [brand, setBrandState] = useState(() => localStorage.getItem(BRAND_KEY) || 'family-affair')
  const [profileOverrides, setProfileOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY)) ?? {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    if (role) {
      localStorage.setItem(ROLE_KEY, role)
    } else {
      localStorage.removeItem(ROLE_KEY)
    }
  }, [role])

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileOverrides))
  }, [profileOverrides])

  useEffect(() => {
    if (brand) localStorage.setItem(BRAND_KEY, brand)
  }, [brand])

  const updateProfile = (updates) => {
    if (!role) return
    setProfileOverrides((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        ...updates,
        ...(updates.name ? { initials: getInitials(updates.name) } : {}),
      },
    }))
  }

  const value = {
    role,
    brand,
    user: role ? { ...demoUsers[role], ...profileOverrides[role] } : null,
    setRole: setRoleState,
    setBrand: setBrandState,
    updateProfile,
    logout: () => setRoleState(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
