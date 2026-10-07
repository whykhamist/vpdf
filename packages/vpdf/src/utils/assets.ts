import type { VPdfAssetUrls } from '../types'

/**
 * Resolve PDF.js asset URLs.
 * Prefer host-provided URLs; fall back to package-copied assets when available.
 */
export function resolveAssetUrls(assets: VPdfAssetUrls = {}): Required<
  Pick<VPdfAssetUrls, 'workerSrc' | 'cMapUrl' | 'standardFontDataUrl' | 'wasmUrl'>
> &
  VPdfAssetUrls {
  const base = inferPackageAssetBase()

  return {
    workerSrc: assets.workerSrc ?? `${base}/pdf.worker.min.mjs`,
    cMapUrl: ensureTrailingSlash(assets.cMapUrl ?? `${base}/cmaps`),
    standardFontDataUrl: ensureTrailingSlash(
      assets.standardFontDataUrl ?? `${base}/standard_fonts`,
    ),
    wasmUrl: ensureTrailingSlash(assets.wasmUrl ?? `${base}/wasm`),
    imageResourcesPath: assets.imageResourcesPath
      ? ensureTrailingSlash(assets.imageResourcesPath)
      : undefined,
  }
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`
}

/**
 * Best-effort: when the CSS/JS is served from /node_modules/@whykhamist/vpdf/dist/,
 * assets live next to it. Hosts should usually set assets.workerSrc explicitly.
 */
function inferPackageAssetBase(): string {
  if (typeof document === 'undefined') return '/pdfjs'
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  for (const script of scripts) {
    const src = script.getAttribute('src')
    if (!src) continue
    if (
      src.includes('@whykhamist/vpdf') ||
      src.includes('@vpdf/vue') ||
      src.includes('/vpdf.js') ||
      src.includes('/vpdf.mjs')
    ) {
      try {
        const url = new URL(src, window.location.href)
        url.pathname = url.pathname.replace(/\/[^/]+$/, '/assets')
        return url.href.replace(/\/$/, '')
      } catch {
        // continue
      }
    }
  }
  return new URL('/node_modules/@whykhamist/vpdf/dist/assets', window.location.origin).href.replace(
    /\/$/,
    '',
  )
}
