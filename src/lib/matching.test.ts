import { describe, expect, it } from 'vitest'
import { compatibility, dateFit, defaultFilters, filterListings } from './matching'
import { initialStore, seedListings } from '../data/seed'
const lifestyle = { sleep: 0, clean: 2, guests: 1, social: 0, smoking: 1, pets: 1 }
const profile = { ...initialStore.profile, lifestyle }
const listing = { ...seedListings[0], lifestyle, pets: false }
describe('honest lifestyle matching', () => {
  it('returns a reproducible perfect score for complete identical preferences', () => { expect(compatibility(profile, listing)).toMatchObject({ score: 100, coverage: 100, conflicts: [] }); expect(compatibility(profile, listing)).toEqual(compatibility(profile, listing)) })
  it('weights cleanliness more than guest frequency', () => { const clean = compatibility(profile, { ...listing, lifestyle: { ...lifestyle, clean: 0 } }); const guests = compatibility(profile, { ...listing, lifestyle: { ...lifestyle, guests: 2 } }); expect(clean.score).toBeLessThan(guests.score!) })
  it('does not invent a score with missing household answers', () => { expect(compatibility(profile, { ...listing, lifestyle: {} }).score).toBeNull(); expect(compatibility(initialStore.profile, listing).score).toBeNull() })
  it('requires at least 60% comparable preference coverage', () => { expect(compatibility(profile, { ...listing, lifestyle: { sleep: 0, clean: 2 } }).score).toBeNull(); expect(compatibility(profile, { ...listing, lifestyle: { sleep: 0, clean: 2, guests: 1 } })).toMatchObject({ score: 100, coverage: 60 }) })
  it('flags pet allergies even without an explicit checkbox', () => { expect(compatibility({ ...profile, lifestyle: { ...lifestyle, pets: 2 } }, { ...listing, pets: true }).conflicts).toContain('Pets in the home') })
  it('flags all explicit deal breakers independently of the numeric score', () => { expect(compatibility({ ...profile, dealbreakers: ['No pets', 'Smoke-free', 'Quiet home'] }, { ...listing, pets: true, lifestyle: { ...lifestyle, smoking: 0, social: 2 } }).conflicts).toHaveLength(3) })
})
describe('academic calendar date fit', () => {
  it('accepts an exact date boundary and a contained stay', () => { expect(dateFit(listing, listing.start, listing.end)).toBe(true); expect(dateFit(listing, '2027-06-01', '2027-07-31')).toBe(true) })
  it('rejects partial overlap and reversed dates', () => { expect(dateFit(listing, '2027-05-01', '2027-08-01')).toBe(false); expect(dateFit(listing, '2027-07-01', '2027-09-01')).toBe(false); expect(dateFit(listing, '2027-07-01', '2027-06-01')).toBe(false) })
  it('handles open-ended searches within the available interval', () => { expect(dateFit(listing, '', '')).toBe(true); expect(dateFit(listing, '', '2027-09-01')).toBe(false); expect(dateFit(listing, '', '2027-01-01')).toBe(false); expect(dateFit(listing, '2028-06-01', '')).toBe(false); expect(dateFit(listing, '2027-06-01', '')).toBe(true) })
})
describe('discovery filters', () => {
  it('loads at least 15 varied demo homes', () => { expect(filterListings(seedListings, defaultFilters, profile)).toHaveLength(18) })
  it('applies semester presets and all practical filters together', () => { const result = filterListings(seedListings, { ...defaultFilters, semester: 'summer', maxPrice: 900, distance: 1, roommates: 2, furnished: 'furnished', utilities: true, type: 'Private room' }, profile); expect(result.length).toBeGreaterThan(0); result.forEach(l => { expect(l.price).toBeLessThanOrEqual(900); expect(l.distance).toBeLessThanOrEqual(1); expect(l.roommates).toBeLessThanOrEqual(2); expect(l.furnished && l.utilities && l.type === 'Private room').toBe(true); expect(l.end >= '2027-08-15' && l.start <= '2027-05-15').toBe(true) }) })
  it('isolates campus and excludes paused/draft homes', () => { expect(filterListings([{ ...listing, campus: 'other' }, { ...listing, status: 'paused' }, { ...listing, status: 'draft' }], defaultFilters, profile)).toHaveLength(0) })
  it('excludes missing scores and hard conflicts when filtering by match', () => { const entries = [listing, { ...listing, id: 'missing', lifestyle: {} }, { ...listing, id: 'conflict', pets: true }]; expect(filterListings(entries, { ...defaultFilters, compatibility: 90 }, { ...profile, dealbreakers: ['No pets'] }).map(l => l.id)).toEqual([listing.id]) })
  it('filters pet-friendly listings', () => { expect(filterListings(seedListings, { ...defaultFilters, pets: true }, profile).every(l => l.pets)).toBe(true) })
  it('selects furnished and unfurnished homes independently', () => {
    const furnished = filterListings(seedListings, { ...defaultFilters, furnished: 'furnished' }, profile)
    const unfurnished = filterListings(seedListings, { ...defaultFilters, furnished: 'unfurnished' }, profile)
    expect(furnished.length).toBeGreaterThan(0)
    expect(unfurnished.length).toBeGreaterThan(0)
    expect(furnished.every(l => l.furnished)).toBe(true)
    expect(unfurnished.every(l => !l.furnished)).toBe(true)
    expect(furnished.length + unfurnished.length).toBe(seedListings.length)
  })
})

