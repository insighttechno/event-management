// Team member data access.
import { teamMembers } from '@/data/users'
import { createCollection } from './store'

export const teamService = createCollection(teamMembers, 'U')
