export function shortenAddress(address: string | null | undefined, chars = 4): string {
  if (!address) return ''
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

const nf = new Intl.NumberFormat('en-US')

export function formatNumber(value: number | bigint): string {
  return nf.format(value)
}

export function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export function formatSol(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)} SOL`
}

export function formatLamportsSol(lamports: number, decimals = 5): string {
  return `${(lamports / 1_000_000_000).toFixed(decimals)} SOL`
}

/** Parses a decimal string safely (no exponent tricks). Returns null when invalid. */
export function parseAmount(input: string): number | null {
  const trimmed = input.trim().replace(/,/g, '')
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return 'ended'
  const s = Math.floor(msRemaining / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${s % 60}s`
}
