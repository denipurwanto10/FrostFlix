import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { filled?: boolean }

function Base({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Base>
)

export const BookmarkIcon = ({ filled, ...p }: IconProps) => (
  <Base {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M6.5 3.5h11a1 1 0 0 1 1 1V20l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1Z" />
  </Base>
)

export const ArrowRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </Base>
)

export const ArrowLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </Base>
)

export const ArrowUpRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Base>
)

export const ChevronLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m15 5-7 7 7 7" />
  </Base>
)

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 5 7 7-7 7" />
  </Base>
)

export const ChevronDownIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
)

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Base>
)

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
)

export const StarIcon = (p: IconProps) => (
  <Base {...p} fill="currentColor" stroke="none">
    <path d="m12 2.8 2.78 5.97 6.52.72-4.86 4.4 1.36 6.43L12 17.1l-5.8 3.22 1.36-6.43L2.7 9.49l6.52-.72L12 2.8Z" />
  </Base>
)

/** Brand mark — icy snowflake on a dark plate. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#0a0b0e" />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="6.5"
        stroke="#d6bf98"
        strokeOpacity="0.28"
      />
      <g stroke="#d6bf98" strokeWidth={1.7} strokeLinecap="round" fill="none">
        <path d="M16 6.5v19" />
        <path d="M7.8 11.25l16.4 9.5" />
        <path d="M24.2 11.25l-16.4 9.5" />
        <path d="M16 6.5l-2.6 2.6M16 6.5l2.6 2.6M16 25.5l-2.6-2.6M16 25.5l2.6-2.6" />
        <path d="M7.8 11.25l3.6.4M7.8 11.25l.4 3.6M24.2 20.75l-3.6-.4M24.2 20.75l-.4-3.6" />
        <path d="M24.2 11.25l-3.6.4M24.2 11.25l-.4 3.6M7.8 20.75l3.6-.4M7.8 20.75l.4-3.6" />
      </g>
    </svg>
  )
}
