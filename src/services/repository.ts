import { initialStore } from '../data/seed'
import type { Store } from '../types'
export interface MarketplaceRepository { load(): Store; save(store: Store): void }
const key = 'roost-demo-v1'
export const demoRepository: MarketplaceRepository = {
  load() { try { const data = JSON.parse(localStorage.getItem(key) || 'null'); return data?.profile && Array.isArray(data.listings) && Array.isArray(data.saved) && Array.isArray(data.swipes) && Array.isArray(data.conversations) && Array.isArray(data.reports) ? data as Store : structuredClone(initialStore) } catch { return structuredClone(initialStore) } },
  save(store) { localStorage.setItem(key, JSON.stringify(store)) },
}
