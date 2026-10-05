/**
 * RIXILE PAD official identity: three stacked geometric bars.
 * top: near black · middle: graphite · bottom: gray
 */
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <g transform="translate(9 6.5) skewX(-13)">
        <rect x={4} y={0} width={34} height={8.6} rx={2.2} fill="var(--logo-bar-1)" />
        <rect x={0} y={13.2} width={38} height={8.6} rx={2.2} fill="var(--logo-bar-2)" />
        <rect x={-4} y={26.4} width={42} height={8.6} rx={2.2} fill="var(--logo-bar-3)" />
      </g>
    </svg>
  )
}

export function LogoWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      style={{
        fontWeight: 650,
        letterSpacing: '0.02em',
        fontSize: compact ? 14.5 : 15.5,
        whiteSpace: 'nowrap',
      }}
    >
      RIXILE <span style={{ color: 'var(--muted)', fontWeight: 600 }}>PAD</span>
    </span>
  )
}
