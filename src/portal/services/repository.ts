import { portalSeed } from '../data/seed'
import type { PortalState } from '../types'
const key = 'roost-portal-demo-v1'
export const portalRepository = {
  load(): PortalState { try { const value = JSON.parse(localStorage.getItem(key) || 'null'); if (value?.version === 1 && Array.isArray(value.agreements) && Array.isArray(value.payments) && Array.isArray(value.requests) && Array.isArray(value.notifications) && Array.isArray(value.audit) && value.settings && value.demoDate) return value; } catch { /* Restore sample state if local storage is unavailable or corrupt. */ } return structuredClone(portalSeed) },
  save(state: PortalState) { localStorage.setItem(key, JSON.stringify(state)) },
}
