import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import Rixile3D from '../components/Rixile3D'
import { ArrowRightIcon } from '../components/Icons'

export default function CTA() {
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div
            className="card"
            style={{
              padding: '56px 40px',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              alignItems: 'center',
              gap: 24,
              overflow: 'hidden',
            }}
          >
            <div>
              <h2 style={{ fontSize: 28, letterSpacing: '-0.03em', marginBottom: 10 }}>
                Ready to launch?
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: 14.5, maxWidth: 420 }}>
                Start your token launch in minutes. Secure, transparent, and built for Solana.
              </p>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/launch" className="btn btn-primary">
                  Start Launch <ArrowRightIcon width={14} height={14} />
                </Link>
                <Link to="/explore" className="btn btn-secondary">
                  Read the docs
                </Link>
              </div>
            </div>
            <div className="cta-3d">
              <Rixile3D size={230} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
