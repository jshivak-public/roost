import type { Store } from '../types'
export function recordSwipe(store: Store, id: string, action: 'like' | 'pass'): Store {
  return { ...store, swipes: [...store.swipes, { id, action, savedBefore: store.saved.includes(id) }], saved: action === 'like' ? [...new Set([...store.saved, id])] : store.saved }
}
export function undoSwipe(store: Store): Store {
  const last = store.swipes.at(-1)
  if (!last) return store
  return { ...store, swipes: store.swipes.slice(0, -1), saved: last.action === 'like' && last.savedBefore === false ? store.saved.filter(id => id !== last.id) : store.saved }
}
