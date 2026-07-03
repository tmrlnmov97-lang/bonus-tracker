// Inline SVG icons (replace the handoff's chest.png with a crisp vector).

export const ChestIcon = ({ size = 30 }: { size?: number }) => (
  <img
    src={`${import.meta.env.BASE_URL}chest.png`}
    alt=""
    width={size}
    height={size}
    style={{ width: size, height: size, objectFit: 'contain', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,.5))' }}
  />
)

export const Twinkle = ({ size = 9, fill = '#ffffff' }: { size?: number; fill?: string }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M6 0 L7.2 4.8 L12 6 L7.2 7.2 L6 12 L4.8 7.2 L0 6 L4.8 4.8 Z" fill={fill} />
  </svg>
)

export const Chevron = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M4 6 L8 10 L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Lock = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="10" width="16" height="10.5" rx="2.5" stroke="currentColor" strokeWidth="2" />
    <path d="M7.5 10 V7.5 a4.5 4.5 0 0 1 9 0 V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const Close = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M2.5 2.5 L9.5 9.5 M9.5 2.5 L2.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export const Check = ({ size = 34, draw = false }: { size?: number; draw?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <path
      d="M10 18.5 L16 24.5 L26 12"
      stroke="#0a1206"
      strokeWidth="3.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={100}
      className={draw ? 'anim-checkDraw' : undefined}
    />
  </svg>
)

export const Retry = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 11 A8 8 0 1 0 18.5 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 5 V11 H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
