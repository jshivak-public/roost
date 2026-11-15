import { createContext } from 'react'
import type { Store } from '../types'
export type MarketplaceContextValue = { store: Store; update: (fn: (s: Store) => Store) => boolean; toast: (message: string) => void; toggleSave: (id: string) => void }
export const MarketplaceContext = createContext<MarketplaceContextValue | null>(null)
