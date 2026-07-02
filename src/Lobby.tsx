import { type ReactNode } from 'react'
import { BonusWidget, type Status } from './BonusWidget'
import { Chevron } from './icons'

function Avatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-full border border-white/10 shrink-0"
      style={{ width: size, height: size, background: 'radial-gradient(circle at 30% 30%, #2a2c34, #14151a)' }}
    />
  )
}

function BalanceChip({ mobile }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="flex items-center justify-center gap-1.5 h-14 w-[76px] rounded-[12px] bg-surface border border-line shrink-0">
        <div className="w-6 h-6 rounded-full bg-gradient-to-b from-lime to-lime-600 flex items-center justify-center text-[13px] font-extrabold text-[#0a0b0d]">$</div>
        <span className="text-[15px] font-extrabold text-ink">0.00</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2.5 h-14 px-5 rounded-[12px] bg-surface border border-line">
      <div className="w-7 h-7 rounded-full bg-gradient-to-b from-lime to-lime-600 flex items-center justify-center text-[14px] font-extrabold text-[#0a0b0d]">$</div>
      <span className="text-[16px] font-extrabold text-ink">0.00</span>
      <span className="text-subtle"><Chevron size={14} /></span>
    </div>
  )
}

const MOBILE_GAMES = 6
const DESKTOP_GAMES = 8

export function Lobby({ mobile, status, toolbar }: { mobile: boolean; status: Status; toolbar?: ReactNode }) {
  return (
    <div className={`bg-bg ${mobile ? 'relative w-full h-full overflow-hidden' : 'min-h-[600px]'}`}>
      {/* ===== HEADER ===== */}
      {mobile ? (
        <header className="flex items-center gap-2 h-20 px-4 bg-header">
          <BonusWidget status={status} mobile />
          <BalanceChip mobile />
          <Avatar size={36} />
        </header>
      ) : (
        <header className="flex items-center gap-4 h-20 px-8 bg-header border-b border-white/[.06] relative z-[5]">
          <div className="flex items-center gap-[9px]">
            <div className="w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-lime to-lime-600 rotate-45" />
            <span className="text-[19px] font-extrabold tracking-[1px] text-ink">LOBBY</span>
          </div>
          <div className="flex-1" />
          <BonusWidget status={status} />
          <BalanceChip />
          <button
            className="h-14 px-7 rounded-[12px] bg-gradient-to-b from-lime to-lime-600 text-[#0a0b0d] text-[16px] font-extrabold cursor-pointer"
            style={{ boxShadow: '0 10px 26px -14px #cdfa50' }}
          >
            Пополнить
          </button>
          <Avatar size={56} />
        </header>
      )}

      {/* control bar sits right under the header */}
      {toolbar}

      {/* ===== LOBBY BODY (context) ===== */}
      <div className={mobile ? 'px-4 pt-4' : 'px-8 pt-7'}>
        <span className={`block font-bold text-ink ${mobile ? 'text-[16px] mb-3' : 'text-[18px] mb-4'}`}>Популярные игры</span>
        <div className={`grid ${mobile ? 'grid-cols-2 gap-3' : 'grid-cols-4 gap-4'}`}>
          {Array.from({ length: mobile ? MOBILE_GAMES : DESKTOP_GAMES }).map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl bg-surface border border-white/[.05] ${mobile ? 'h-[120px]' : 'h-[150px]'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
