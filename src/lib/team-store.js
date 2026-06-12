// Shared in-memory team list so the sidebar reacts when an admin changes
// a member's module access on the Team page. (Backend replaces this later.)
import { teamMembers as seed } from '@/data/users'

let members = [...seed]
const listeners = new Set()

export function getTeamMembers() {
  return members
}

export function setTeamMembers(next) {
  members = next
  listeners.forEach((listener) => listener())
}

export function subscribeTeam(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
