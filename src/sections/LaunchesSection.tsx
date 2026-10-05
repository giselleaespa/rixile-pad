import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { ArrowRightIcon } from '../components/Icons'
import { DEMO_LAUNCHES } from '../lib/demoLaunches'
import LaunchCard from '../components/LaunchCard'

export default function LaunchesSection() {
  const featured = DEMO_LAUNCHES.slice(0, 3)

  return (
    <section className="section" id="launches">
      <div className="container">
        <Reveal>
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p className="eyebrow">LAUNCHES</p>
              <h2 className="section-title">Live &amp; upcoming</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="chip chip-demo"><span className="dot" /> DEMO DATA</span>
              <Link to="/explore" className="btn btn-secondary btn-sm">
                View all <ArrowRightIcon width={13} height={13} />
              </Link>
            </div>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="card-grid-3">
          {featured.map((l, i) => (
            <Reveal key={l.id} delay={i * 70}>
              <LaunchCard launch={l} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
