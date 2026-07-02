import { useState } from 'react'
import { Lobby } from './Lobby'
import { type Status } from './BonusWidget'
import { GuideTour, type TourStep } from './GuideTour'

const STATES: { key: Status; label: string }[] = [
  { key: 'default', label: 'Expanded · default' },
  { key: 'almost', label: 'Почти готово · <10%' },
  { key: 'danger', label: 'Меньше часа · <1ч' },
  { key: 'success', label: 'Success' },
  { key: 'error', label: 'Error · нет связи' },
]

const TOUR: TourStep[] = [
  { selector: '[data-tour="device"]', title: 'Шаг 1 · Устройство', text: 'Переключай Desktop / Mobile — превью перестроится под выбранное устройство.' },
  { selector: '[data-tour="state"]', title: 'Шаг 2 · Состояние экрана', text: 'Выбери сценарий: прогресс, «почти готово», «меньше часа», успех или ошибка связи.' },
  { selector: '[aria-label="bonus"]', title: 'Шаг 3 · Виджет-пилюля', text: 'Кликни пилюлю в шапке — раскроется панель бонуса: дропдаун на десктопе, bottom sheet на мобилке.' },
]

type Device = 'desktop' | 'mobile'

function ControlBar({
  device,
  setDevice,
  status,
  setStatus,
  onGuide,
}: {
  device: Device
  setDevice: (d: Device) => void
  status: Status
  setStatus: (s: Status) => void
  onGuide: () => void
}) {
  return (
    <div className="bg-[#0a0b0d] border-b border-white/[.08] px-6 py-4 flex flex-col gap-3.5">
      {/* text guide — what's what */}
      <div className="flex items-start justify-between gap-4">
        <span className="flex items-start gap-2 text-[13px] text-subtle leading-relaxed">
          <span className="text-[15px] leading-none anim-iconBob mt-px">👆</span>
          <span>
            <b className="text-lime font-extrabold">Как тестировать:</b> выбери{' '}
            <b className="text-ink">устройство</b> и <b className="text-ink">состояние экрана</b>, затем кликни{' '}
            <b className="text-ink">виджет-пилюлю в шапке</b> — раскроется панель бонуса.
          </span>
        </span>
        <button
          onClick={onGuide}
          className="shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-lg text-[13px] font-bold text-lime border border-lime/30 bg-lime/[.06] hover:bg-lime/[.12] transition-colors cursor-pointer"
        >
          🔦 Гайд
        </button>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* device */}
        <span className="text-faint text-[11px] font-bold uppercase tracking-[1px]">Устройство</span>
        <div data-tour="device" className="flex gap-1 p-1 rounded-xl bg-surface border border-line">
          {(['desktop', 'mobile'] as Device[]).map((dv) => {
            const active = dv === device
            return (
              <button
                key={dv}
                onClick={() => setDevice(dv)}
                className={
                  'px-4 h-9 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ' +
                  (active ? 'bg-gradient-to-b from-lime to-lime-600 text-[#0a0b0d]' : 'text-subtle hover:text-ink')
                }
              >
                {dv === 'desktop' ? '🖥 Desktop' : '📱 Mobile'}
              </button>
            )
          })}
        </div>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* state */}
        <span className="text-faint text-[11px] font-bold uppercase tracking-[1px]">Состояние</span>
        <div data-tour="state" className="flex items-center gap-2.5 flex-wrap">
          {STATES.map((s) => {
            const active = s.key === status
            return (
              <button
                key={s.key}
                onClick={() => setStatus(s.key)}
                className={
                  'px-4 h-9 rounded-lg text-[13px] font-bold border transition-colors cursor-pointer ' +
                  (active
                    ? 'bg-gradient-to-b from-lime to-lime-600 text-[#0a0b0d] border-transparent'
                    : 'bg-surface text-subtle border-line hover:text-ink hover:border-white/20')
                }
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [status, setStatus] = useState<Status>('default')
  const [device, setDevice] = useState<Device>('desktop')
  const [tour, setTour] = useState(true)
  const mobile = device === 'mobile'

  const bar = (
    <ControlBar device={device} setDevice={setDevice} status={status} setStatus={setStatus} onGuide={() => setTour(true)} />
  )

  return (
    <div className="min-h-screen bg-[#050506] font-sans text-ink">
      {mobile ? (
        <>
          {/* mobile: control bar sticky on top so states + device stay reachable */}
          <div className="sticky top-0 z-[100]">{bar}</div>
          <div className="flex justify-center py-10">
            {/* phone frame: 10px bezel → 390×844 content, 1:1 with Figma M · * frames */}
            <div className="relative w-[410px] h-[864px] rounded-[48px] overflow-hidden border-[10px] border-[#15161a] shadow-[0_50px_120px_-24px_rgba(0,0,0,.85)]">
              <Lobby mobile status={status} />
            </div>
          </div>
        </>
      ) : (
        /* desktop: control bar sits under the lobby header, above the games */
        <Lobby mobile={false} status={status} toolbar={bar} />
      )}

      {tour && <GuideTour steps={TOUR} onClose={() => setTour(false)} />}
    </div>
  )
}
