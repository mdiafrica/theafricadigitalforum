/**
 * Social/brand glyphs. lucide dropped brand icons in v1, so these are minimal
 * inline SVGs. They inherit `currentColor` and accept standard SVG props.
 */
type IconProps = React.SVGProps<SVGSVGElement>

const base = (props: IconProps) => ({
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true as const,
  ...props,
})

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5Z" />
    </svg>
  )
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002ZM7 8.48H3V21h4V8.48Zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68Z" />
    </svg>
  )
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M18.9 2h3.3l-7.2 8.24L23.7 22h-6.62l-5.18-6.78L5.97 22H2.66l7.7-8.8L2.3 2h6.79l4.68 6.19L18.9 2Zm-1.16 18h1.83L7.34 3.9H5.38L17.74 20Z" />
    </svg>
  )
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base({ fill: "none", ...props })}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" />
    </svg>
  )
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M23 12s0-3.4-.43-5.03a2.62 2.62 0 0 0-1.85-1.86C19.1 4.68 12 4.68 12 4.68s-7.1 0-8.72.43a2.62 2.62 0 0 0-1.85 1.86C1 8.6 1 12 1 12s0 3.4.43 5.03c.24.9.94 1.6 1.85 1.86 1.62.43 8.72.43 8.72.43s7.1 0 8.72-.43a2.62 2.62 0 0 0 1.85-1.86C23 15.4 23 12 23 12ZM9.75 15.02V8.98L15 12l-5.25 3.02Z" />
    </svg>
  )
}
