import { useEffect, useState } from 'react'

/**
 * Count-up animation, ported from the handoff `count()` helper.
 * Eases 0 -> `to` over `dur` ms (cubic ease-out). Re-runs when `runKey` changes.
 */
export function useCountUp(to: number, runKey: number, active = true, dur = 1300): number {
  const [val, setVal] = useState(to)
  useEffect(() => {
    if (!active) {
      setVal(to)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const e = 1 - Math.pow(1 - t, 3)
      setVal(to * e)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey, to, active])
  return val
}
