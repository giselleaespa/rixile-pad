import { useCallback, useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

/** Reads the REAL balance of the connected wallet and refreshes on connect/tx. */
export function useSolBalance() {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalance(null)
      return
    }
    setLoading(true)
    try {
      const lamports = await connection.getBalance(publicKey, 'confirmed')
      setBalance(lamports / LAMPORTS_PER_SOL)
    } catch {
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }, [connection, publicKey, connected])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { balance, loading, refresh }
}
