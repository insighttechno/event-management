// Shared in-memory client list so converting a lead on the Leads page makes a
// real client appear on the Clients page. (Backend replaces this later.)
import { clients as seed } from '@/data/clients'

let clients = [...seed]
const listeners = new Set()

export function getClients() {
  return clients
}

export function setClients(next) {
  clients = next
  listeners.forEach((listener) => listener())
}

export function addClient(client) {
  setClients([client, ...clients])
}

export function subscribeClients(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
