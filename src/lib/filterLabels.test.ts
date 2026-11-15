import { expect, it } from 'vitest'
import { filterLabel } from './filterLabels'
import { defaultFilters } from './matching'
it('gives furniture and roommate filters readable names', () => {
  expect(filterLabel('furnished', { ...defaultFilters, furnished: 'unfurnished' })).toBe('Unfurnished')
  expect(filterLabel('roommates', { ...defaultFilters, roommates: 0 })).toBe('No roommates')
})
it('includes the year in custom move dates', () => {
  expect(filterLabel('start', { ...defaultFilters, start: '2028-01-10' })).toBe('Move in Jan 10, 2028')
})
