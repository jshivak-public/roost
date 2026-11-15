import { expect, it } from 'vitest'
import { initialStore } from '../data/seed'
import { recordSwipe, undoSwipe } from './actions'
it('undoes a like and the save it created', () => { expect(undoSwipe(recordSwipe(initialStore, 'home-1', 'like'))).toEqual(initialStore) })
it('keeps a bookmark that predates an undone like', () => { const store = { ...initialStore, saved: ['home-1'] }; expect(undoSwipe(recordSwipe(store, 'home-1', 'like'))).toEqual(store) })
it('never changes saved listings on pass or undo pass', () => { const store = { ...initialStore, saved: ['home-1'] }; expect(recordSwipe(store, 'home-1', 'pass').saved).toEqual(['home-1']); expect(undoSwipe(recordSwipe(store, 'home-1', 'pass'))).toEqual(store) })
it('does not duplicate a saved home when liking', () => { expect(recordSwipe({ ...initialStore, saved: ['home-1'] }, 'home-1', 'like').saved).toEqual(['home-1']) })
