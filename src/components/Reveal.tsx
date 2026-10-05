import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Scroll-reveal wrapper using a tiny IntersectionObserver + CSS animation. */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className + (shown ? ' reveal-in' : '')}
      style={{ opacity: shown ? undefined : 0, animationDelay: shown ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  )
}
