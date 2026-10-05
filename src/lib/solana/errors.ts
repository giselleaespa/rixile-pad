export type TxErrorKind =
  | 'not-connected'
  | 'rejected'
  | 'insufficient-funds'
  | 'network'
  | 'rpc'
  | 'timeout'
  | 'invalid-params'
  | 'unknown'

export interface MappedTxError {
  kind: TxErrorKind
  title: string
  message: string
}

/** Maps raw wallet / RPC / chain errors into clean, user-facing states. Never fabricates success. */
export function mapTxError(e: unknown): MappedTxError {
  const raw = e instanceof Error ? e : new Error(String(e))
  const msg = `${raw.message || ''} ${raw.name || ''}`.toLowerCase()

  if (
    raw.name === 'WalletNotConnectedError' ||
    raw.name === 'WalletNotSelectedError' ||
    msg.includes('wallet not connected') ||
    msg.includes('no wallet selected')
  ) {
    return {
      kind: 'not-connected',
      title: 'Wallet not connected',
      message: 'Connect a Solana wallet before creating a token.',
    }
  }

  if (
    msg.includes('403') ||
    msg.includes('user rejected') ||
    msg.includes('user denied') ||
    msg.includes('rejected the request') ||
    msg.includes('cancelled') ||
    msg.includes('canceled') ||
    msg.includes('declined')
  ) {
    return {
      kind: 'rejected',
      title: 'Transaction cancelled',
      message: 'The wallet request was rejected. No transaction was sent.',
    }
  }

  if (
    msg.includes('insufficient') ||
    msg.includes('not enough') ||
    msg.includes('0x1') ||
    msg.includes('custom program error: 0x1')
  ) {
    return {
      kind: 'insufficient-funds',
      title: 'Insufficient SOL',
      message: 'Your wallet does not have enough SOL to cover the mint account rent and network fee. Get devnet SOL from a faucet and try again.',
    }
  }

  if (
    msg.includes('blockhash') ||
    msg.includes('block height') ||
    msg.includes('expired')
  ) {
    return {
      kind: 'timeout',
      title: 'Transaction expired',
      message: 'The transaction was not confirmed before the blockhash expired. Try again.',
    }
  }

  if (
    msg.includes('timeout') ||
    msg.includes('timed out')
  ) {
    return {
      kind: 'timeout',
      title: 'Transaction timed out',
      message: 'The network did not confirm the transaction in time. Check Solscan before retrying — the token may already exist.',
    }
  }

  if (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network error') ||
    msg.includes('fetch failed') ||
    msg.includes('load failed')
  ) {
    return {
      kind: 'rpc',
      title: 'RPC connection failed',
      message: 'Could not reach the Solana network endpoint. Check your connection and try again.',
    }
  }

  if (msg.includes('invalid') || msg.includes('param')) {
    return {
      kind: 'invalid-params',
      title: 'Invalid token parameters',
      message: 'The token configuration could not be applied on-chain. Review the values and try again.',
    }
  }

  if (
    msg.includes('transaction failed') ||
    msg.includes('simulation failed') ||
    msg.includes('error')
  ) {
    return {
      kind: 'network',
      title: 'Transaction failed',
      message: 'The network rejected the transaction. ' + (raw.message ? `Detail: ${raw.message.slice(0, 160)}` : 'Try again.'),
    }
  }

  return {
    kind: 'unknown',
    title: 'Something went wrong',
    message: raw.message ? raw.message.slice(0, 200) : 'An unexpected error occurred. Try again.',
  }
}
