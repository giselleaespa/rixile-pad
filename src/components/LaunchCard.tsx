import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { DemoLaunch } from '../lib/demoLaunches'
import { demoProgress } from '../lib/demoLaunches'
import { formatCountdown } from '../lib/format'
import { ArrowRightIcon, ClockIcon, UsersIcon } from './Icons'

export function TokenAvatar({ symbol, accent, size = 44 }: { symbol: string; accent: string; size?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 9,
        background: accent,
        color: '#FAFAFA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 650,
        fontSize: size * 0.3,
        letterSpacing: '-0.02em',
        flex: 'none',
        border: '1px solid var(--border)',
      }}
    >
      {symbol.slice(0, 3)}
    </div>
  )
}

function StatusChip({ status }: { status: DemoLaunch['status'] }) {
  if (status === 'live') return <span className="chip chip-live"><span className="dot" /> Live</span>
  if (status === 'upcoming') return <span className="chip chip-upcoming"><span className="dot" style={{ background: 'var(--warning)' }} /> Upcoming</span>
  return <span className="chip chip-completed"><span className="dot" /> Completed</span>
}

export default function LaunchCard({ launch }: { launch: DemoLaunch }) {
  const [, tick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const endsAt = launch.endsAt ?? 0
  const remaining = endsAt - Date.now()
  const progress = demoProgress(launch)

  return (
    <div className="card card-hover" style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <StatusChip status={launch.status} />
        {launch.status !== 'completed' && remaining > 0 && (
          <span className="mono hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <ClockIcon width={12} height={12} /> {formatCountdown(remaining)}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <TokenAvatar symbol={launch.symbol} accent={launch.accent} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{launch.name}</div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>${launch.symbol}</div>
        </div>
      </div>

      <p className="hint" style={{ fontSize: 12.5, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {launch.description}
      </p>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: 'var(--text-2)' }}>
            Raised <span className="mono" style={{ color: 'var(--text)', fontWeight: 600 }}>{launch.raisedSol.toFixed(1)}</span>
            {' '}/ {launch.targetSol.toFixed(0)} SOL
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} className="hint">
            <UsersIcon width={12} height={12} /> {launch.participants}
          </span>
        </div>
      </div>

      <Link
        to={`/token/${launch.id}`}
        className="btn btn-secondary btn-block"
        tabIndex={-1}
        aria-label={`View ${launch.name} launch`}
      >
        View launch <ArrowRightIcon width={13} height={13} />
      </Link>
    </div>
  )
}
