import type { Filters, Lifestyle, Listing, Profile } from '../types'
import { semesters, questions } from '../data/config'
const weights: Record<keyof Lifestyle, number> = { sleep: 20, clean: 25, guests: 15, social: 15, smoking: 15, pets: 10 }
export function compatibility(profile: Pick<Profile, 'lifestyle' | 'dealbreakers'>, listing: Pick<Listing, 'lifestyle' | 'pets'>) {
  let total = 0, known = 0
  const breakdown: { label: string; score: number; detail: string }[] = []
  const conflicts: string[] = []
  for (const q of questions) {
    const a = profile.lifestyle[q.key], b = listing.lifestyle[q.key]
    if (a === undefined || b === undefined) continue
    const score = Math.max(0, 1 - Math.abs(a - b) / (q.options.length - 1))
    total += score * weights[q.key]; known += weights[q.key]
    breakdown.push({ label: q.label, score: Math.round(score * 100), detail: q.options[b] })
  }
  if ((profile.dealbreakers.includes('No pets') || profile.lifestyle.pets === 2) && listing.pets) conflicts.push('Pets in the home')
  if (profile.dealbreakers.includes('Smoke-free') && listing.lifestyle.smoking === 0) conflicts.push('Smoking allowed')
  if (profile.dealbreakers.includes('Quiet home') && listing.lifestyle.social === 2) conflicts.push('Social household')
  return { score: known < 60 ? null : Math.round(total / known * 100), coverage: known, breakdown, conflicts }
}
export const defaultFilters: Filters = { maxPrice: 1800, semester: '', start: '', end: '', distance: 3, type: '', roommates: 4, furnished: '', utilities: false, pets: false, compatibility: 0 }
export function dateFit(listing: Pick<Listing, 'start' | 'end'>, start: string, end: string) {
  return (!start || (listing.start <= start && start <= listing.end)) && (!end || (listing.start <= end && end <= listing.end)) && !(start && end && start > end)
}
export function filterListings(listings: Listing[], filters: Filters, profile: Profile) {
  const semester = semesters.find(s => s.id === filters.semester)
  return listings.filter(l => {
    const match = compatibility(profile, l)
    return l.campus === 'uiuc' && l.status === 'active' && l.price <= filters.maxPrice && l.distance <= filters.distance && l.roommates <= filters.roommates && (!filters.type || l.type === filters.type) && (!filters.furnished || l.furnished === (filters.furnished === 'furnished')) && (!filters.utilities || l.utilities) && (!filters.pets || l.pets) && (!filters.compatibility || (match.score !== null && match.score >= filters.compatibility && !match.conflicts.length)) && dateFit(l, filters.start || semester?.start || '', filters.end || semester?.end || '')
  })
}
export const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
export const date = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

