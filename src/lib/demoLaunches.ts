/**
 * DEMO DATA — clearly labeled in the UI as "DEMO".
 * These launches are NOT real on-chain tokens. They exist to demonstrate the
 * explore experience until real indexed launch data is available.
 */

export interface DemoLaunch {
  id: string
  name: string
  symbol: string
  description: string
  status: 'live' | 'upcoming' | 'completed'
  raisedSol: number
  targetSol: number
  participants: number
  pricePerTokenSol: number
  liquiditySol: number
  startsAt: number | null
  endsAt: number | null
  accent: string
}

const HOUR = 3_600_000
const now = Date.now()

export const DEMO_LAUNCHES: DemoLaunch[] = [
  {
    id: 'demo-solana-yield-fund',
    name: 'Solana Yield Fund',
    symbol: 'SYF',
    description: 'A transparent on-chain yield vault index. Demo launch used to preview the RIXILE PAD explore experience.',
    status: 'live',
    raisedSol: 18.4,
    targetSol: 45,
    participants: 214,
    pricePerTokenSol: 0.000021,
    liquiditySol: 33.1,
    startsAt: now - 26 * HOUR,
    endsAt: now + 66 * HOUR,
    accent: '#18181B',
  },
  {
    id: 'demo-depin-network',
    name: 'DePIN Network',
    symbol: 'DPN',
    description: 'Decentralized physical infrastructure token. Demo launch used to preview the RIXILE PAD explore experience.',
    status: 'live',
    raisedSol: 7.2,
    targetSol: 30,
    participants: 96,
    pricePerTokenSol: 0.000012,
    liquiditySol: 12.4,
    startsAt: now - 9 * HOUR,
    endsAt: now + 39 * HOUR,
    accent: '#56565E',
  },
  {
    id: 'demo-aurora-compute',
    name: 'Aurora Compute',
    symbol: 'AUR',
    description: 'GPU compute marketplace launch. Demo launch used to preview the RIXILE PAD explore experience.',
    status: 'upcoming',
    raisedSol: 0,
    targetSol: 60,
    participants: 0,
    pricePerTokenSol: 0.00004,
    liquiditySol: 0,
    startsAt: now + 20 * HOUR,
    endsAt: now + 92 * HOUR,
    accent: '#A3A3AB',
  },
  {
    id: 'demo-signal-protocol',
    name: 'Signal Protocol',
    symbol: 'SGN',
    description: 'Messaging infra token. Completed demo launch shown for illustration only.',
    status: 'completed',
    raisedSol: 88.6,
    targetSol: 80,
    participants: 641,
    pricePerTokenSol: 0.000055,
    liquiditySol: 79.7,
    startsAt: now - 240 * HOUR,
    endsAt: now - 96 * HOUR,
    accent: '#3F3F46',
  },
]

export function demoProgress(l: DemoLaunch): number {
  if (l.targetSol <= 0) return 0
  return Math.min(100, (l.raisedSol / l.targetSol) * 100)
}
