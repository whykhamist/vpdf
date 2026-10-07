import {
  DEFAULT_DESTINATION_OFFSET,
  DEFAULT_PAGE_GAP,
  DEFAULT_PAGE_RADIUS,
} from './defaults'

/** Finite px value >= 0, otherwise unset. */
export function resolveNonNegativePx(value: unknown): number | undefined {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return undefined
  return n
}

/** Multiply chrome px by viewer scale (1 = 100%). Invalid/omitted scale leaves px unchanged. */
export function scaleChromePx(px: number, scale: unknown): number {
  const s = Number(scale)
  if (!Number.isFinite(s) || s <= 0) return px
  return px * s
}

/** Space between pages in px at 100% scale. Explicit 0 is kept; omit/invalid uses the default. */
export function resolvePageGap(value: unknown, scale?: unknown): number {
  return scaleChromePx(resolveNonNegativePx(value) ?? DEFAULT_PAGE_GAP, scale)
}

/** Page corner radius in px at 100% scale. 0 = square (unset); omit/invalid uses the default. */
export function resolvePageRadius(value: unknown, scale?: unknown): number | undefined {
  const n = resolveNonNegativePx(value) ?? DEFAULT_PAGE_RADIUS
  if (n <= 0) return undefined
  return scaleChromePx(n, scale)
}

/** Top inset when jumping to a destination (outline, links, search matches), in px at 100% scale. Explicit 0 is kept; omit/invalid uses the default. */
export function resolveDestinationOffset(value: unknown, scale?: unknown): number {
  return scaleChromePx(resolveNonNegativePx(value) ?? DEFAULT_DESTINATION_OFFSET, scale)
}

/** Pull destination scrollTop up by `offset` px, clamped to the document start. */
export function applyDestinationScrollOffset(top: number, offset: unknown): number {
  const pad = resolveNonNegativePx(offset) ?? 0
  return Math.max(0, top - pad)
}
