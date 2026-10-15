import sharp from "sharp"

/** Lucide icon shapes, rendered to PNG because email clients block inline SVG. */
const ICONS = {
  "check-circle":
    '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  calendar:
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  megaphone:
    '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
} as const

export type EmailIconName = keyof typeof ICONS

const cache = new Map<EmailIconName, Promise<Buffer>>()

export function renderEmailIcon(name: EmailIconName, color = "#7c3aed") {
  let png = cache.get(name)
  if (!png) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`
    png = sharp(Buffer.from(svg), { density: 576 })
      .resize(48, 48)
      .png()
      .toBuffer()
    cache.set(name, png)
  }
  return png
}
