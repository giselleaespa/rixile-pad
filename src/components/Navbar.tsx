import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogoMark, LogoWordmark } from './Logo'
import WalletButton from './WalletButton'
import { useTheme } from '../wallet/useTheme'
import { NETWORK_LABEL } from '../lib/config'
import { SunIcon, MoonIcon, MenuIcon, XIcon } from './Icons'

const NAV_ITEMS = [
  { label: 'Launch', to: '/launch' },
  { label: 'Explore', to: '/explore' },
  { label: 'How it works', to: '/#how-it-works', hash: 'how-it-works' },
  { label: 'Docs', to: '/#features', hash: 'features' },
]

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const goTo = (item: (typeof NAV_ITEMS)[number]) => {
    setMenuOpen(false)
    if (item.hash) {
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => {
          document.getElementById(item.hash!)?.scrollIntoView({ behavior: 'smooth' })
        }, 80)
      } else {
        document.getElementById(item.hash)?.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(item.to)
    }
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 80,
        background: 'color-mix(in srgb, var(--bg) 86%, transparent)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 24, height: 62 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }} aria-label="RIXILE PAD home">
          <LogoMark size={22} />
          <LogoWordmark />
        </Link>

        <nav aria-label="Main" style={{ display: 'flex', gap: 4, marginLeft: 12 }} className="nav-desktop">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className="btn btn-ghost btn-sm"
              onClick={() => goTo(item)}
              style={{ letterSpacing: '0.01em' }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="chip mono nav-net" style={{ fontSize: 9.5 }}>
            <span className="dot" style={{ background: 'var(--success)' }} />
            {NETWORK_LABEL.replace('SOLANA ', '').replace('-BETA', '')}
          </span>
          <button className="icon-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <div className="wallet-desktop">
            <WalletButton />
          </div>
          <button
            className="icon-btn nav-mobile-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="nav-mobile" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div className="container" style={{ padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className="btn btn-ghost"
                style={{ justifyContent: 'flex-start', height: 44 }}
                onClick={() => goTo(item)}
              >
                {item.label}
              </button>
            ))}
            <div style={{ paddingTop: 8 }}>
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
