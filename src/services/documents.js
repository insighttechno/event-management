// Document library + contract template data access.
import { documents, contractTemplates } from '@/data/documents'
import { createCollection } from './store'

export const documentsService = createCollection(documents, 'D')
export const templatesService = createCollection(contractTemplates, 'CT')
