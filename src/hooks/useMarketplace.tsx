import { useContext } from 'react'
import { MarketplaceContext } from './marketplaceContext'
export function useMarketplace() { const context = useContext(MarketplaceContext); if (!context) throw new Error('Marketplace provider is missing'); return context }
