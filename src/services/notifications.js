// Notification data access.
import { notifications } from '@/data/notifications'
import { createCollection } from './store'

export const notificationsService = createCollection(notifications, 'N')
