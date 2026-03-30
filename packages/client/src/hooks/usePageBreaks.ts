import { useEffect, useState } from 'react'

const PAGE_HEIGHT = 1056

export function usePageBreaks(containerRef: React.RefObject<HTMLElement>) {
  const [breakCount, setBreakCount] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(() => {
      const pages = Math.ceil(el.scrollHeight / PAGE_HEIGHT)
      setBreakCount(Math.max(0, pages - 1))
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef])

  return breakCount
}
