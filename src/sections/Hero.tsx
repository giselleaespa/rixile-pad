import { Link } from 'react-router-dom'
import Rixile3D from '../components/Rixile3D'
import Reveal from '../components/Reveal'
import { ArrowRightIcon } from '../components/Icons'

export default function Hero() {
  return (
    <section style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
      <div
        className="container hero-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
          alignItems: 'center',
          gap: 40,
          minHeight: 'calc(88vh - 62px)',
          padding: '64px 24px',
        }}
      >
        <div>
          <Reveal>
            <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 24, height: 1, background: 'var(--border-strong)', display: 'inline-block' }} />
              SOLANA TOKEN LAUNCHPAD
            </p>
          </Reveal>
          <Reveal delay={90}>
            <h1 style={{ fontSize: 'clamp(38px, 5.2vw, 58px)', lineHeight: 1.06, letterSpacing: '-0.035em' }}>
              Launch tokens on Solana.
              <br />
              <span style={{ color: 'var(--text-2)' }}>Built for fair launches.</span>
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p style={{ marginTop: 22, maxWidth: 460, fontSize: 16.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Create, launch and discover tokens with transparent on-chain mechanics.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div style={{ marginTop: 34, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/launch" className="btn btn-primary btn-lg">
                Launch a token <ArrowRightIcon width={15} height={15} />
              </Link>
              <Link to="/explore" className="btn btn-secondary btn-lg">
                Explore launches
              </Link>
            </div>
          </Reveal>
          <Reveal delay={340}>
            <p className="mono" style={{ marginTop: 44, fontSize: 10.5, letterSpacing: '0.16em', color: 'var(--muted)' }}>
              NON-CUSTODIAL&nbsp;&nbsp;/&nbsp;&nbsp;ON-CHAIN&nbsp;&nbsp;/&nbsp;&nbsp;TRANSPARENT
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} className="hero-3d">
          <Rixile3D size={430} />
        </Reveal>
      </div>
    </section>
  )
}
