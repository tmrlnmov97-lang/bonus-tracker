import { useEffect, useLayoutEffect, useState } from 'react'

export type TourStep = { selector: string; title: string; text: string }

const EASE = 'cubic-bezier(.22,1,.36,1)'

export function GuideTour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const measure = () => {
    const el = document.querySelector(steps[i]?.selector)
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      setRect(el.getBoundingClientRect())
    } else {
      setRect(null)
    }
  }

  useLayoutEffect(() => {
    measure()
    const t = setTimeout(measure, 380) // re-measure after scroll/layout settles
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  useEffect(() => {
    const on = () => measure()
    window.addEventListener('resize', on)
    window.addEventListener('scroll', on, true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'Enter') setI((v) => (v >= steps.length - 1 ? v : v + 1))
      if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', on)
      window.removeEventListener('scroll', on, true)
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  const step = steps[i]
  const last = i === steps.length - 1
  const pad = 8
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800

  const box = rect
    ? { top: rect.top - pad, left: rect.left - pad, w: rect.width + pad * 2, h: rect.height + pad * 2 }
    : { top: vh / 2 - 20, left: vw / 2 - 20, w: 40, h: 40 }

  // tooltip: below the target, flip above if not enough room
  const ttW = 340
  const ttH = 210
  const below = box.top + box.h + 14
  const placeAbove = below + ttH > vh - 14
  const ttTop = placeAbove ? Math.max(14, box.top - ttH - 14) : below
  const ttLeft = Math.min(Math.max(box.left, 14), vw - ttW - 14)

  const moveT = `top .42s ${EASE}, left .42s ${EASE}, width .42s ${EASE}, height .42s ${EASE}`

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* spotlight — dims everything, cuts out the target */}
      <div
        className="fixed rounded-[14px]"
        style={{
          top: box.top,
          left: box.left,
          width: box.w,
          height: box.h,
          boxShadow: '0 0 0 9999px rgba(0,0,0,.72), 0 0 0 3px rgba(205,250,80,.9), 0 0 34px 6px rgba(205,250,80,.35)',
          transition: moveT,
        }}
      />

      {/* tooltip */}
      <div
        key={i}
        className="fixed w-[340px] p-5 rounded-2xl border border-white/10 bg-[#14151a] pointer-events-auto anim-tourIn"
        style={{ top: ttTop, left: ttLeft, boxShadow: '0 30px 70px -20px rgba(0,0,0,.9)', transition: `top .42s ${EASE}, left .42s ${EASE}` }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-lime text-[12px] font-extrabold tracking-[1px]">ШАГ {i + 1} / {steps.length}</span>
          <button onClick={onClose} className="text-faint hover:text-ink text-[12px] font-semibold transition-colors cursor-pointer">Пропустить ✕</button>
        </div>
        <div className="text-ink text-[17px] font-extrabold mb-1.5">{step?.title}</div>
        <p className="text-subtle text-[13px] leading-relaxed mb-4">{step?.text}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, k) => (
              <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-5 bg-lime' : 'w-1.5 bg-white/20'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {i > 0 && (
              <button
                onClick={() => setI(i - 1)}
                className="px-3 h-9 rounded-lg text-[13px] font-bold text-subtle hover:text-ink transition-colors cursor-pointer"
              >
                Назад
              </button>
            )}
            <button
              onClick={() => (last ? onClose() : setI(i + 1))}
              className="px-4 h-9 rounded-lg text-[13px] font-extrabold text-[#0a0b0d] bg-gradient-to-b from-lime to-lime-600 cursor-pointer"
            >
              {last ? 'Понятно 🎉' : 'Далее →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
