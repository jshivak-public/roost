import { createContext, useContext } from 'react'
import type { Agreement, Participant, PortalState, SessionDocument } from './types'
export type PortalContextValue = { state: PortalState; actor: string; setActor: (id: string) => void; agreement: Agreement; member: Participant; selectedId: string; select: (id: string) => void; agreements: Agreement[]; commit: (operation: (state: PortalState) => PortalState) => boolean; documents: SessionDocument[]; upload: (file: File, type: string) => SessionDocument; removeDocument: (id: string) => void }
export const PortalContext = createContext<PortalContextValue | null>(null)
export function usePortal() { const context = useContext(PortalContext); if (!context) throw new Error('Portal context missing'); return context }
