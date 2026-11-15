import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Store } from '../types'
import { demoRepository } from '../services/repository'
import { MarketplaceContext } from '../hooks/marketplaceContext'
export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState(() => demoRepository.load())
  const current = useRef(store)
  const [notice, setNotice] = useState('')
  function toast(message: string) { setNotice(message); window.setTimeout(() => setNotice(value => value === message ? '' : value), 4500) }
  function update(fn: (s: Store) => Store) {
    const next = fn(current.current)
    try { demoRepository.save(next); current.current = next; setStore(next); return true } catch { toast('Your browser storage is full or unavailable. Remove a few uploaded photos and try again.'); return false }
  }
  function toggleSave(id: string) { update(s => ({ ...s, saved: s.saved.includes(id) ? s.saved.filter(x => x !== id) : [...s.saved, id] })) }
  return <MarketplaceContext.Provider value={{ store, update, toast, toggleSave }}>{children}<div className={`toast ${notice ? 'show' : ''}`} role="status">{notice}</div></MarketplaceContext.Provider>
}
