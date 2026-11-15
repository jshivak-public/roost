import { withReminders } from './lib/reminders'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMarketplace } from '../hooks/useMarketplace'
import { portalRepository } from './services/repository'
import { demoPeople } from './data/seed'
import { PortalContext } from './context'
import type { PortalState, SessionDocument } from './types'
import { participant } from './lib/actions'
export function PortalProvider({ children }: { children: ReactNode }) {
  const { toast } = useMarketplace(); const [state, setState] = useState(() => withReminders(portalRepository.load())); const current = useRef(state); const [actor, setActorState] = useState('you'); const [params, setParams] = useSearchParams(); const [documents, setDocuments] = useState<SessionDocument[]>([])
  const documentUrls = useRef(new Set<string>())
  useEffect(() => { const urls = documentUrls.current; return () => { urls.forEach(url => URL.revokeObjectURL(url)); urls.clear() } }, [])
  const agreements = state.agreements.filter(a => a.participants.some(p => p.userId === actor)); const agreement = agreements.find(a => a.id === params.get('sublease')) || agreements[0]; const member = participant(agreement, actor)
  function commit(operation: (state: PortalState) => PortalState) { try { const next = withReminders(operation(current.current)); portalRepository.save(next); current.current = next; setState(next); return true } catch (e) { toast(e instanceof Error ? e.message : 'Could not save this change.'); return false } }
  function select(id: string) { if (agreements.some(a => a.id === id)) setParams(p => { p.set('sublease', id); return p }) }
  function setActor(id: string) { if (!demoPeople.some(p => p.id === id)) return; setActorState(id) }
  function upload(file: File, type: string) {
    participant(agreement, actor)
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'].includes(file.type) || file.size > 8 * 1024 * 1024) throw new Error('Choose a PDF, JPG, PNG, WebP, or text file under 8 MB.')
    const doc = { id: crypto.randomUUID(), agreementId: agreement.id, name: file.name, type, by: actor, time: new Date().toISOString(), file, url: URL.createObjectURL(file) }; documentUrls.current.add(doc.url); setDocuments(docs => [...docs, doc]); return doc
  }
  function removeDocument(id: string) { const doc = documents.find(d => d.id === id && d.agreementId === agreement.id && d.by === actor); if (!doc) return; URL.revokeObjectURL(doc.url); documentUrls.current.delete(doc.url); setDocuments(docs => docs.filter(d => d.id !== id)) }
  return <PortalContext.Provider value={{ state, actor, setActor, agreement, member, selectedId: agreement.id, select, agreements, commit, documents: documents.filter(d => d.agreementId === agreement.id), upload, removeDocument }}>{children}</PortalContext.Provider>
}
