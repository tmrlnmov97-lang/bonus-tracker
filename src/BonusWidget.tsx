import { useEffect, useRef, useState } from 'react'
import { useCountUp } from './useCountUp'
import { Confetti } from './Confetti'
import { ChestIcon, Twinkle, Chevron, Close, Check, Retry } from './icons'

export type Status = 'default' | 'almost' | 'danger' | 'success' | 'error'

type Data = {
  pct: number
  wagered: number
  total: number
  remaining: number
  expiry: string
  expiryDanger: boolean
  bonusBal: number
  withdraw: number
  notif: null | 'lime' | 'red'
  pillPct: number
  pillNum: number
}

const D: Record<Status, Data> = {
  default: { pct: 62, wagered: 620, total: 1000, remaining: 380, expiry: '6 дней', expiryDanger: false, bonusBal: 500, withdraw: 250, notif: null, pillPct: 62, pillNum: 620 },
  almost:  { pct: 92, wagered: 920, total: 1000, remaining: 80,  expiry: '6 дней', expiryDanger: false, bonusBal: 500, withdraw: 50, notif: 'lime', pillPct: 92, pillNum: 920 },
  danger:  { pct: 96, wagered: 960, total: 1000, remaining: 40, expiry: '< 1 часа', expiryDanger: true, bonusBal: 500, withdraw: 50, notif: 'red', pillPct: 96, pillNum: 960 },
  success: { pct: 100, wagered: 1000, total: 1000, remaining: 0, expiry: '—', expiryDanger: false, bonusBal: 0, withdraw: 1000, notif: null, pillPct: 100, pillNum: 1000 },
  error:   { pct: 62, wagered: 620, total: 1000, remaining: 380, expiry: '—', expiryDanger: false, bonusBal: 500, withdraw: 250, notif: null, pillPct: 62, pillNum: 620 },
}

const money = (n: number) => '$' + Math.round(n)
// thousands with thin space, matching the Figma pill ("$1 000")
const moneySp = (n: number) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
// HH:MM:SS countdown formatter
const fmtTimer = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return [h, m, sec].map((v) => String(v).padStart(2, '0')).join(':')
}

// Collapsed bonus-pill variants — 1:1 with the Figma component set 125:414.
type PillCfg = {
  money: number; total: number; fillPct: number; fillGray: boolean
  moneyLime: boolean; moneyMuted: boolean
  dot: string | null; star: boolean
  sub: string | null; subColor: string; tileNeutral: boolean
}
const PILL: Record<Status, PillCfg> = {
  default: { money: 620,  total: 1000, fillPct: 40,  fillGray: false, moneyLime: false, moneyMuted: false, dot: null,      star: true,  sub: null,                      subColor: '',        tileNeutral: false },
  almost:  { money: 920,  total: 1000, fillPct: 92,  fillGray: false, moneyLime: false, moneyMuted: false, dot: '#a6e22e', star: false, sub: 'осталось совсем немного',  subColor: '#a6e22e', tileNeutral: false },
  danger:  { money: 960,  total: 1000, fillPct: 96,  fillGray: false, moneyLime: false, moneyMuted: false, dot: '#ff5a6a', star: false, sub: 'сгорает через 47 мин',     subColor: '#e64a5a', tileNeutral: false },
  success: { money: 1000, total: 1000, fillPct: 100, fillGray: false, moneyLime: true,  moneyMuted: false, dot: '#d7fb63', star: false, sub: 'готово к выводу',           subColor: '#cdfa50', tileNeutral: false },
  error:   { money: 620,  total: 1000, fillPct: 50,  fillGray: true,  moneyLime: false, moneyMuted: true,  dot: '#9ea3a8', star: false, sub: 'нет связи · обновим позже', subColor: '#ff8792', tileNeutral: true },
}

export function BonusWidget({ status, mobile = false }: { status: Status; mobile?: boolean }) {
  const d = D[status]
  const [open, setOpen] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const [bannerClosed, setBannerClosed] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // when open, the badge calms to the neutral "default" styling (star, no dot/subtitle/stripe)
  // but keeps the REAL money + loader of the current state (green when fully wagered)
  const pillStatus: Status = open ? 'default' : status
  let p = PILL[pillStatus]
  if (open) {
    const cur = PILL[status]
    p = { ...PILL.default, money: cur.money, total: cur.total, fillPct: cur.fillPct, moneyLime: status === 'success' }
  }
  const pillError = pillStatus === 'error'
  const pillDanger = pillStatus === 'danger'

  // live countdown for the "меньше часа" state — 00:47:13
  const [dangerSecs, setDangerSecs] = useState(47 * 60 + 13)
  useEffect(() => {
    if (status !== 'danger') return
    setDangerSecs(47 * 60 + 13)
    const id = setInterval(() => setDangerSecs((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [status])

  const numActive = status !== 'error'
  const wagerVal = useCountUp(d.wagered, runKey, open && numActive)
  const balVal = useCountUp(d.bonusBal, runKey, open && numActive)
  const wdVal = useCountUp(d.withdraw, runKey, open && numActive)

  useEffect(() => {
    setBannerClosed(false)
    setRunKey((k) => k + 1)
  }, [status])

  // expanded progress-bar fill (ported from runAnim)
  useEffect(() => {
    if (!open || status === 'error' || status === 'success') return
    const bar = barRef.current
    if (!bar) return
    bar.style.transition = 'none'
    bar.style.width = '0%'
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!barRef.current) return
        barRef.current.style.transition = 'width 1.4s cubic-bezier(.22,1,.36,1)'
        barRef.current.style.width = d.pct + '%'
      }),
    )
    return () => cancelAnimationFrame(id)
  }, [open, runKey, d.pct, status])

  // click-outside to close
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return
      if (btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const toggle = () => {
    if (open) setOpen(false)
    else {
      setOpen(true)
      setRunKey((k) => k + 1)
    }
  }

  const isError = status === 'error'
  const isSuccess = status === 'success'
  const showNotif = d.notif && !bannerClosed

  const shine = <span className="absolute top-0 left-0 w-[55%] h-full anim-ctaShine" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)' }} />
  const ctaLime =
    'text-[#0a0b0d] bg-gradient-to-b from-lime to-lime-600 ' +
    'hover:from-lime-300 hover:to-lime active:from-lime-600 active:to-lime-600 ' +
    'shadow-[0_16px_36px_-20px_rgba(205,250,80,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] ' +
    'hover:shadow-[0_18px_42px_-16px_rgba(205,250,80,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] ' +
    'active:shadow-[0_8px_20px_-16px_rgba(205,250,80,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]'
  const ctaGold =
    'text-[#3a2a05] bg-gradient-to-b from-[#f9dd8a] to-[#e2a83e] ' +
    'hover:from-[#fde9a4] hover:to-[#eeb84f] active:from-[#e2a83e] active:to-[#e2a83e] ' +
    'shadow-[0_16px_36px_-20px_rgba(226,168,62,0.5),inset_0_1px_0_rgba(255,255,255,0.5)] ' +
    'hover:shadow-[0_18px_42px_-16px_rgba(226,168,62,0.65),inset_0_1px_0_rgba(255,255,255,0.6)] ' +
    'active:shadow-[0_8px_20px_-16px_rgba(226,168,62,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]'
  const ctaBtn = (label: string, gold = false) => (
    <button
      className={
        'relative overflow-hidden w-full h-[46px] rounded-lg text-[14px] font-semibold tracking-[.2px] ' +
        'hover:-translate-y-px active:translate-y-0 active:scale-[.985] transition-[transform,box-shadow] duration-150 ease-out ' +
        (gold ? ctaGold : ctaLime)
      }
    >
      {shine}
      <span className="relative">{label}</span>
    </button>
  )

  const NotifBanner = () =>
    showNotif ? (
      <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${d.notif === 'lime' ? 'anim-glowLime' : 'anim-glowRed'}`} style={{ background: d.notif === 'lime' ? 'linear-gradient(180deg, rgba(205,250,80,.08), rgba(205,250,80,.03))' : 'linear-gradient(180deg, rgba(255,90,106,.09), rgba(255,90,106,.03))', borderColor: d.notif === 'lime' ? 'rgba(205,250,80,.22)' : 'rgba(255,90,106,.24)' }}>
        <span className={`text-[18px] leading-none ${d.notif === 'lime' ? 'anim-fire' : 'anim-hour'}`}>{d.notif === 'lime' ? '🔥' : '⏳'}</span>
        <span className="flex-1 min-w-0 text-[13px] font-semibold text-subtle leading-[1.35]">
          {d.notif === 'lime' ? (
            <>
              <b className="text-lime font-extrabold">Почти готово</b> — осталось <b className="text-ink font-extrabold">${d.remaining}</b>
            </>
          ) : (
            <>
              <b className="text-danger-300 font-extrabold">Меньше часа</b> — до сгорания
            </>
          )}
        </span>
        <button onClick={() => setBannerClosed(true)} aria-label="close" className="flex-none w-[22px] h-[22px] rounded-[7px] bg-white/5 text-[#7a7f87] flex items-center justify-center cursor-pointer transition-colors hover:bg-white/[.12] hover:text-ink">
          <Close size={10} />
        </button>
      </div>
    ) : null

  const panelBg = isSuccess
    ? 'radial-gradient(120% 62% at 50% -6%, rgba(205,250,80,.12), transparent 58%), linear-gradient(180deg, #17181e 0%, #101116 100%)'
    : 'linear-gradient(180deg, #17181e 0%, #101116 100%)'
  const panelBorderColor = isSuccess ? 'rgba(205,250,80,.18)' : 'rgba(255,255,255,.09)'

  // Shared panel content — rendered inside the desktop dropdown OR the mobile bottom sheet.
  const panelBody = (
    <>
      {isSuccess && <Confetti runKey={runKey} />}
      <div className="relative z-[1]">
        {isSuccess ? (
          /* ===== SUCCESS (Figma 104:774) — key on runKey so the reveal replays each open ===== */
          <div key={runKey} className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <span className="text-[24px] font-extrabold leading-none tracking-[-.4px] text-ink anim-rise">Welcome Bonus</span>
              {/* animated seal */}
              <div className="w-full h-[160px] flex items-center justify-center">
                <div className="relative w-[130px] h-[130px] flex items-center justify-center">
                  <div className="absolute w-[210px] h-[210px] rounded-full anim-rays" style={{ background: 'repeating-conic-gradient(from 0deg, rgba(205,250,80,.16) 0deg 5deg, transparent 5deg 16deg)', WebkitMaskImage: 'radial-gradient(circle, #000 26%, transparent 60%)', maskImage: 'radial-gradient(circle, #000 26%, transparent 60%)' }} />
                  <div className="absolute w-[124px] h-[124px] rounded-full anim-ringOut" style={{ border: '2px solid rgba(205,250,80,.5)' }} />
                  {/* burst ring on reveal */}
                  <div className="absolute w-[118px] h-[118px] rounded-full anim-sealRing" style={{ border: '3px solid rgba(205,250,80,.9)' }} />
                  <div className="relative w-[118px] h-[118px] rounded-full flex items-center justify-center anim-sealPop bg-gradient-to-b from-lime to-lime-600">
                    <Check size={50} draw />
                  </div>
                  <span className="absolute top-1 right-1 anim-twinkle"><Twinkle size={15} fill="#f3c969" /></span>
                  <span className="absolute bottom-2 left-2 anim-twinkle"><Twinkle size={11} fill="#ffffff" /></span>
                </div>
              </div>
              {/* heading + subtext (divider = bottom border) */}
              <div className="flex flex-col gap-2 w-full border-b border-[#27282c] pb-5 anim-rise" style={{ animationDelay: '.5s' }}>
                <span className="text-[24px] font-extrabold leading-none text-ink text-center w-full">Бонус отыгран!</span>
                <div className="flex items-baseline justify-center gap-1 w-full">
                  <span className="text-[16px] font-medium text-lime">{money(wdVal)}</span>
                  <span className="text-[14px] font-semibold text-muted">разблокировано и готово к выводу</span>
                </div>
              </div>
              {/* details */}
              <div className="flex flex-col gap-2 w-full text-[14px] font-semibold anim-rise" style={{ animationDelay: '.62s' }}>
                <div className="flex items-center justify-between"><span className="text-muted">Бонусный баланс</span><span className="text-ink">{money(balVal)}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted">К выводу после отыгрыша</span><span className="text-lime">{money(wdVal)}</span></div>
              </div>
            </div>
            <div className="anim-rise" style={{ animationDelay: '.74s' }}>{ctaBtn('Перевести на счёт', true)}</div>
          </div>
        ) : isError ? (
          /* ===== ERROR (Figma 104:889) ===== */
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
              <span className="text-[24px] font-extrabold leading-none tracking-[-.4px] text-ink">Welcome Bonus</span>
              {/* error icon (kept pulse + shake) */}
              <div className="w-full h-[160px] flex items-center justify-center">
                <div className="w-[108px] h-[108px] rounded-[26px] flex items-center justify-center anim-errPulse" style={{ background: 'linear-gradient(180deg, #2b1a1e, #201417)', border: '1px solid rgba(255,90,106,.28)', boxShadow: '0 0 13px rgba(255,90,106,.3)' }}>
                  <span className="text-[60px] font-extrabold text-danger leading-none anim-errShake">!</span>
                </div>
              </div>
              {/* heading + subtext (divider = bottom border) */}
              <div className="flex flex-col gap-2 w-full border-b border-[#27282c] pb-5">
                <span className="text-[24px] font-extrabold leading-none text-ink text-center w-full">Нет связи с сервером</span>
                <span className="text-[14px] font-semibold text-muted text-center w-full">Прогресс обновится, когда связь вернётся</span>
              </div>
              {/* last value */}
              <div className="flex items-baseline justify-center gap-[5px] w-full text-[14px] font-semibold">
                <span className="text-[#73787d]">Последнее значение:</span>
                <span className="text-[#9ea3a8]">${d.wagered} / ${d.total}</span>
                <span className="text-[#73787d]">· устарело</span>
              </div>
            </div>
            {/* secondary retry button */}
            <button className="flex items-center justify-center gap-2 w-full h-[46px] rounded-lg bg-[#27282c] border border-white/10 text-ink text-[14px] font-semibold cursor-pointer transition-colors hover:bg-[#31323a] active:bg-[#212426]">
              <Retry size={16} />
              <span>Повторить</span>
            </button>
          </div>
        ) : (
          /* ===== DEFAULT / ALMOST / DANGER (Figma 106:169) ===== */
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <span className="text-[24px] font-extrabold leading-none tracking-[-.4px] text-ink">Welcome Bonus</span>
              {NotifBanner()}
              {/* Progress info (divider = bottom border) */}
              <div className="flex flex-col gap-3 w-full border-b border-[#27282c] pb-5">
                <div className="flex flex-col gap-2">
                  <span className="text-[12px] font-medium leading-none text-muted">Отыгрыш</span>
                  <div className="flex items-baseline gap-0.5 leading-none">
                    <span className="text-[24px] font-extrabold text-white">{money(wagerVal)}</span>
                    <span className="text-[16px] font-medium text-[#9ea3a8]">/${d.total}</span>
                  </div>
                </div>
                <div className="relative h-[10px] rounded-full bg-white/[.06] overflow-hidden">
                  <div ref={barRef} className="absolute left-0 top-0 h-[10px] rounded-full bg-gradient-to-r from-[#a6e22e] to-[#cdfa50] overflow-hidden" style={{ width: '0%', boxShadow: '0 0 14px -2px rgba(205,250,80,.6)' }}>
                    <span className="absolute top-0 left-0 w-[42%] h-full anim-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent)' }} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between text-[14px] font-semibold leading-none w-full">
                  <span className="text-muted">Осталось <span className="text-[#d7d7d7] font-bold">${d.remaining}</span></span>
                  <span className="text-muted">Истекает через <span className={`font-bold tabular-nums ${d.expiryDanger ? 'text-danger-300' : 'text-[#d7d7d7]'}`}>{status === 'danger' ? fmtTimer(dangerSecs) : d.expiry}</span></span>
                </div>
              </div>
              {/* Bonus details */}
              <div className="flex flex-col gap-2 w-full text-[14px] font-semibold">
                <div className="flex items-center justify-between"><span className="text-muted">Бонусный баланс</span><span className="text-ink">{money(balVal)}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted">К выводу после отыгрыша</span><span className="text-gold">{money(wdVal)}</span></div>
              </div>
            </div>
            {/* CTA section */}
            <div className="flex flex-col gap-4 w-full">
              <span className="text-[12px] font-medium leading-none text-faint">Условие: отыгрыш ×30 только в слотах</span>
              {ctaBtn('Перейти к играм')}
            </div>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className={mobile ? 'contents' : 'relative'}>
      {/* PILL (collapsed) — 1:1 with Figma bonus-pill set 125:414, handoff animMini kept */}
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label="bonus"
        className={`relative flex items-center overflow-hidden w-[230px] h-14 p-2 rounded-[12px] bg-surface border border-white/10 cursor-pointer transition-colors hover:bg-elevated font-sans ${pillError ? '' : 'anim-pillGlow'}`}
      >
        {/* danger urgency stripe (Figma 125:540) */}
        {pillDanger && <span className="absolute left-0 top-[9px] h-[36px] w-[2px] rounded-full bg-[#ff5a6a]" />}
        <div className={`flex-1 flex items-center gap-2 min-w-0 ${pillDanger ? 'opacity-80' : ''}`}>
          {/* icon-tile */}
          <div
            className={`relative flex-none w-[31px] h-[30px] rounded-[9px] flex items-center justify-center ${pillError ? '' : 'anim-tilePulse'}`}
            style={{ background: p.tileNeutral ? '#212426' : 'linear-gradient(180deg, rgba(205,250,80,.2), rgba(205,250,80,.05))' }}
          >
            <span className={pillError ? '' : 'anim-iconBob'} style={{ transformOrigin: '50% 60%' }}>
              <ChestIcon size={28} />
            </span>
            {p.star ? (
              <span className="absolute left-[24px] top-0 anim-twinkle">
                <Twinkle size={7} />
              </span>
            ) : p.dot ? (
              <span className="absolute left-[24px] top-0 w-[7px] h-[7px]">
                {!pillError && <span className="absolute inset-0 rounded-full anim-dotPing" style={{ background: p.dot }} />}
                <span
                  className={`absolute inset-0 rounded-full ${pillError ? '' : 'anim-dotCore'}`}
                  style={{ background: p.dot, boxShadow: pillError ? undefined : `0 0 5px ${p.dot}` }}
                />
              </span>
            ) : null}
          </div>
          {/* txtcol */}
          <div className={`flex-1 flex flex-col items-start min-w-[96px] overflow-hidden ${pillStatus === 'default' ? 'gap-[5px]' : 'gap-1 h-10 justify-center'}`}>
            <div className="flex items-baseline gap-1 leading-none whitespace-nowrap">
              <span className={`text-[14px] font-semibold ${p.moneyMuted ? 'text-[#565b62]' : p.moneyLime ? 'text-lime' : 'text-ink'}`}>{moneySp(p.money)}</span>
              <span className="text-[12px] font-medium text-[#565b62]">/ {moneySp(p.total)}</span>
            </div>
            {p.sub && (
              <span className="text-[10px] font-medium leading-none whitespace-nowrap" style={{ color: p.subColor }}>{p.sub}</span>
            )}
            <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: p.fillPct + '%', background: p.fillGray ? '#73787d' : 'linear-gradient(90deg, #a6e22e, #cdfa50)' }} />
            </div>
          </div>
          {/* chevron */}
          <span className="flex-none w-[14px] text-subtle transition-transform duration-300" style={{ transform: open ? 'rotate(180deg)' : 'none', transitionTimingFunction: 'cubic-bezier(.22,1,.36,1)' }}>
            <Chevron size={14} />
          </span>
        </div>
      </button>

      {mobile ? (
        /* ===== MOBILE: bottom sheet (Figma M · * frames) ===== */
        <>
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-40 bg-black/60"
            style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .32s ease' }}
          />
          <div
            ref={panelRef}
            className="absolute inset-x-4 bottom-0 z-50 px-6 pt-7 pb-7 rounded-t-[22px] border-x border-t overflow-hidden"
            style={{
              background: panelBg,
              borderColor: panelBorderColor,
              boxShadow: '0 -18px 50px -18px rgba(0,0,0,.85)',
              transform: open ? 'translateY(0)' : 'translateY(106%)',
              transition: 'transform .4s cubic-bezier(.22,1,.36,1)',
            }}
          >
            <span className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-[5px] rounded-full bg-white/25 z-[2]" />
            {panelBody}
          </div>
        </>
      ) : (
        /* ===== DESKTOP: dropdown (Figma node 106:169) ===== */
        <div
          ref={panelRef}
          className="absolute right-0 w-[380px] p-6 rounded-[20px] border z-20"
          style={{
            top: 'calc(100% + 12px)',
            background: panelBg,
            borderColor: panelBorderColor,
            boxShadow: '0 30px 70px -22px rgba(0,0,0,.9)',
            transformOrigin: 'top right',
            opacity: open ? 1 : 0,
            transform: open ? 'none' : 'translateY(-10px) scale(.97)',
            visibility: open ? 'visible' : 'hidden',
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity .28s ease, transform .3s cubic-bezier(.22,1,.36,1), visibility .28s',
            overflow: isSuccess ? 'hidden' : 'visible',
          }}
        >
          {panelBody}
        </div>
      )}
    </div>
  )
}
