import { useMemo, useState } from 'react'
import LaunchCard from '../components/LaunchCard'
import { DEMO_LAUNCHES, type DemoLaunch } from '../lib/demoLaunches'
import { SearchIcon } from '../components/Icons'

type StatusFilter = 'all' | 'live' | 'upcoming' | 'completed'
type SortKey = 'newest' | 'funded' | 'ending'

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'live', label: 'LIVE' },
  { id: 'upcoming', label: 'UPCOMING' },
  { id: 'completed', label: 'COMPLETED' },
]

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'newest', label: 'NEWEST' },
  { id: 'funded', label: 'MOST FUNDED' },
  { id: 'ending', label: 'ENDING SOON' },
]

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<SortKey>('newest')

  const results = useMemo(() => {
    let list: DemoLaunch[] = [...DEMO_LAUNCHES]
    if (filter !== 'all') list = list.filter((l) => l.status === filter)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.symbol.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q),
      )
    }
    if (sort === 'funded') list.sort((a, b) => b.raisedSol - a.raisedSol)
    if (sort === 'ending') list.sort((a, b) => (a.endsAt ?? 0) - (b.endsAt ?? 0))
    if (sort === 'newest') list.sort((a, b) => (b.startsAt ?? 0) - (a.startsAt ?? 0))
    return list
  }, [query, filter, sort])

  return (
    <div className="container page-enter" style={{ padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p className="eyebrow">EXPLORE</p>
          <h1 style={{ fontSize: 26, letterSpacing: '-0.02em' }}>Discover launches</h1>
        </div>
        <span className="chip chip-demo"><span className="dot" /> DEMO DATA — REAL LAUNCHES APPEAR HERE ONCE INDEXED</span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }} role="search">
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <SearchIcon
            width={15}
            height={15}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
          />
          <input
            className="input"
            style={{ paddingLeft: 38 }}
            placeholder="Search tokens..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search tokens"
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className="btn btn-sm"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              style={{
                border: '1px solid ' + (filter === f.id ? 'var(--border-strong)' : 'var(--border)'),
                background: filter === f.id ? 'var(--card)' : 'transparent',
                color: filter === f.id ? 'var(--text)' : 'var(--text-2)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                boxShadow: filter === f.id ? 'var(--shadow-card)' : 'none',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} role="group" aria-label="Sort launches">
          {SORTS.map((s) => (
            <button
              key={s.id}
              className="btn btn-sm"
              onClick={() => setSort(s.id)}
              aria-pressed={sort === s.id}
              style={{
                border: '1px solid ' + (sort === s.id ? 'var(--border-strong)' : 'var(--border)'),
                background: sort === s.id ? 'var(--surface-2)' : 'transparent',
                color: sort === s.id ? 'var(--text)' : 'var(--text-2)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-2)' }}>No launches match your search.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="card-grid-3">
          {results.map((l) => (
            <LaunchCard key={l.id} launch={l} />
          ))}
        </div>
      )}
    </div>
  )
}
