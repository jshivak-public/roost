import type { Filters } from '../types'
import { semesters } from '../data/config'
import { date, money } from './matching'

export function filterLabel(key: keyof Filters, filters: Filters): string {
  switch (key) {
    case 'maxPrice': return `Up to ${money(filters.maxPrice)}/mo`
    case 'semester': return semesters.find(s => s.id === filters.semester)?.label || 'Any semester'
    case 'start': return `Move in ${date(filters.start)}, ${filters.start.slice(0, 4)}`
    case 'end': return `Move out ${date(filters.end)}, ${filters.end.slice(0, 4)}`
    case 'distance': return `Within ${filters.distance} mi`
    case 'type': return filters.type
    case 'roommates': return filters.roommates === 0 ? 'No roommates' : `Up to ${filters.roommates} roommates`
    case 'furnished': return filters.furnished === 'unfurnished' ? 'Unfurnished' : 'Furnished'
    case 'utilities': return 'Utilities included'
    case 'pets': return 'Pets welcome'
    case 'compatibility': return `${filters.compatibility}%+ lifestyle match`
  }
}
