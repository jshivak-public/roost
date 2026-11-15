import type { Filters } from '../types'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import { defaultFilters } from '../lib/matching'
import { semesters } from '../data/config'

export function FiltersPanel({ open, setOpen, filters, setFilters, count }: {
  open: boolean
  setOpen: (open: boolean) => void
  filters: Filters
  setFilters: (filters: Filters) => void
  count: number
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters({ ...filters, [key]: value })
  const invalidDates = !!(filters.start && filters.end && filters.start > filters.end)
  return (
    <Dialog open={open} onOpenChange={setOpen} title="A place that fits." description="Fine-tune the practical things. We’ll handle the discovery.">
      <div className="form-stack">
        <label>Monthly budget <strong>${filters.maxPrice}</strong>
          <input type="range" min="400" max="1800" step="25" value={filters.maxPrice} onChange={e => set('maxPrice', +e.target.value)} />
        </label>
        <label>Your semester
          <select value={filters.semester} onChange={e => setFilters({ ...filters, semester: e.target.value, start: '', end: '' })}>
            <option value="">Any semester</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <div className="form-grid">
          <label>Move in<input type="date" value={filters.start} onChange={e => set('start', e.target.value)} /></label>
          <label>Move out<input type="date" min={filters.start} value={filters.end} onChange={e => set('end', e.target.value)} /></label>
          <label>Space type
            <select value={filters.type} onChange={e => set('type', e.target.value)}>
              <option value="">Any space</option><option>Private room</option><option>Entire apartment</option>
            </select>
          </label>
          <label>Max roommates
            <select value={filters.roommates} onChange={e => set('roommates', +e.target.value)}>
              {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n === 0 ? 'Just me' : `Up to ${n}`}</option>)}
            </select>
          </label>
        </div>
        {invalidDates && <p className="error-text" role="alert">Choose a move-out date on or after your move-in date.</p>}
        <label>Furniture
          <select value={filters.furnished} onChange={e => set('furnished', e.target.value as Filters['furnished'])}>
            <option value="">Furnished or unfurnished</option>
            <option value="furnished">Furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
        </label>
        <label>Distance to campus <strong>{filters.distance} miles</strong>
          <input type="range" min="0.2" max="3" step="0.1" value={filters.distance} onChange={e => set('distance', +e.target.value)} />
        </label>
        <label>Minimum lifestyle match <strong>{filters.compatibility}%</strong>
          <input type="range" min="0" max="100" step="5" value={filters.compatibility} onChange={e => set('compatibility', +e.target.value)} />
        </label>
        <p className="text-sm muted">Match filters require enough lifestyle answers. Any deal-breaker conflicts are excluded when a minimum match is set.</p>
        <div className="check-grid">
          {(['utilities', 'pets'] as const).map(key => <label className="check-label" key={key}>
            <input type="checkbox" checked={filters[key]} onChange={e => set(key, e.target.checked)} />
            {key === 'utilities' ? 'Utilities included' : 'Pets welcome'}
          </label>)}
        </div>
        <div className="row between">
          <Button variant="ghost" onClick={() => setFilters(defaultFilters)}>Reset filters</Button>
          <Button disabled={invalidDates} onClick={() => setOpen(false)}>Show {count} spaces</Button>
        </div>
      </div>
    </Dialog>
  )
}
