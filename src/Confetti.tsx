import { useEffect, useRef } from 'react'

// Radial confetti burst — ported from the handoff `burstConfetti()`.
const COLORS = ['#cdfa50', '#f3c969', '#ffffff', '#cdfa50', '#f3c969', '#ff7a86', '#ffffff', '#f3c969', '#cdfa50', '#cdfa50', '#ff7a86', '#f3c969', '#ffffff', '#cdfa50']

export function Confetti({ runKey }: { runKey: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const box = ref.current
    if (!box) return
    const pieces = Array.from(box.querySelectorAll('span'))
    const n = pieces.length
    pieces.forEach((p, i) => {
      const angle = (i / n) * 360 + (Math.random() * 26 - 13)
      const rad = (angle * Math.PI) / 180
      const power = 78 + Math.random() * 95
      const dx = Math.cos(rad) * power
      const dy = Math.sin(rad) * power - 26
      const fall = 140 + Math.random() * 110
      const rot = Math.random() * 1000 - 500
      const dur = 1000 + Math.random() * 750
      ;(p as HTMLElement).style.opacity = '1'
      p.animate(
        [
          { transform: 'translate(-50%, -50%) scale(.3) rotate(0deg)', opacity: 1, offset: 0, easing: 'cubic-bezier(.12,.86,.3,1)' },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rot * 0.45}deg)`, opacity: 1, offset: 0.32, easing: 'cubic-bezier(.4,0,.7,1)' },
          { transform: `translate(calc(-50% + ${dx * 1.06}px), calc(-50% + ${dy + fall}px)) scale(.85) rotate(${rot}deg)`, opacity: 0, offset: 1 },
        ],
        { duration: dur, fill: 'forwards', delay: i * 6 },
      )
    })
  }, [runKey])

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none">
      {COLORS.map((c, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: '150px',
            left: '50%',
            width: (i % 2 ? 6 : 5) + 'px',
            height: 6 + (i % 3) + 'px',
            borderRadius: i % 2 ? '50%' : '2px',
            background: c,
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}
