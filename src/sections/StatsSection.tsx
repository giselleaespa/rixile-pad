import CountUp from '../components/CountUp'
import Reveal from '../components/Reveal'

const STATS = [
  { label: 'Tokens Launched', value: 1284, format: (n: number) => Math.round(n).toLocaleString('en-US') },
  { label: 'Total Volume', value: 42.8, format: (n: number) => `$${n.toFixed(1)}M` },
  { label: 'Active Users', value: 18200, format: (n: number) => `${(n / 1000).toFixed(1)}k` },
  { label: 'Avg. Raise', value: 86, format: (n: number) => `$${Math.round(n)}k` },
]

/**
 * Sample statistics until real launch indexing is available.
 * Clearly labeled DEMO DATA in the UI — never presented as production figures.
 */
export default function StatsSection() {
  return (
    <section className="section" aria-label="Platform statistics" style={{ padding: '56px 0' }}>
      <div className="container">
        <Reveal>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <p className="eyebrow" style={{ margin: 0 }}>PLATFORM STATISTICS</p>
            <span className="chip chip-demo">
              <span className="dot" /> DEMO DATA — WILL BE INDEXED ON-CHAIN
            </span>
          </div>
          <div
            className="card"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              padding: '26px 8px',
            }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                style={{
                  textAlign: 'center',
                  padding: '4px 16px',
                  borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div className="hint" style={{ marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 650, letterSpacing: '-0.03em' }}>
                  <CountUp to={s.value} format={s.format} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
