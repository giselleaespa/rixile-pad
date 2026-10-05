import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Subtle count-up for statistic displays. Respects reduced motion. */
export default function CountUp({
  to,
  format,
  duration = 900,
  children,
}: {
  to: number
  format?: (n: number) => string
  duration?: number
  children?: ReactNode
}) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = ref.current
    if (!el) return

    const run = () => {
      if (started.current) return
      started.current = true
      if (reduced) {
        setValue(to)
        return
      }
      const t0 = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setValue(to * eased)
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run()
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration])

  return (
    <span ref={ref}>
      {format ? format(value) : Math.round(value).toLocaleString('en-US')}
      {children}
    </span>
  )
}
