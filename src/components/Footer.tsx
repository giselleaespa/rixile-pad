import { Link } from 'react-router-dom'
import { LogoMark, LogoWordmark } from './Logo'
import { NETWORK_LABEL } from '../lib/config'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div className="container" style={{ padding: '40px 24px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark size={20} />
          <LogoWordmark compact />
        </div>
        <nav aria-label="Footer" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Link to="/launch" className="hint" style={{ color: 'var(--text-2)' }}>Launch</Link>
          <Link to="/explore" className="hint" style={{ color: 'var(--text-2)' }}>Explore</Link>
          <a href="#how-it-works" className="hint" style={{ color: 'var(--text-2)' }}>How it works</a>
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span className="chip mono" style={{ fontSize: 9.5 }}>{NETWORK_LABEL}</span>
          <span className="hint">Non-custodial · On-chain · Transparent</span>
        </div>
      </div>
    </footer>
  )
}
