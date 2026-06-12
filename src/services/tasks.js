// Task data access.
import { tasks } from '@/data/tasks'
import { createCollection } from './store'

export const tasksService = createCollection(tasks, 'T')
