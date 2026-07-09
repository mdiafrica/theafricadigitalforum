import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/** Fires once when the element scrolls into view. */
export function useInView<T extends Element = HTMLDivElement>(
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, ...options }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}

/** Eases a number from 0 → target once `started` is true. */
export function useCountUp(target: number, duration = 1800, started = false) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)
    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.round(easeOutQuart(progress) * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [started, target, duration])

  return count
}

/** Fade + rise reveal on scroll into view. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: React.ElementType
}) {
  const { ref, inView } = useInView()
  return (
    <Tag
      ref={ref}
      className={cn(className)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </Tag>
  )
}
