import type { VPdfSource } from '../types'

export interface NormalizedSource {
  /** Value passed to pdfjs getDocument */
  data: string | URL | Uint8Array | ArrayBuffer
  /** Object URL created by the package that must be revoked later */
  objectUrl?: string
  filename?: string
}

export function isBinarySource(source: VPdfSource): source is ArrayBuffer | Uint8Array {
  return source instanceof ArrayBuffer || source instanceof Uint8Array
}

export function normalizeSource(source: VPdfSource): NormalizedSource {
  if (typeof source === 'string') {
    return { data: source, filename: filenameFromUrl(source) }
  }

  if (source instanceof URL) {
    return { data: source.href, filename: filenameFromUrl(source.href) }
  }

  if (source instanceof File) {
    const objectUrl = URL.createObjectURL(source)
    return { data: objectUrl, objectUrl, filename: source.name }
  }

  if (source instanceof Blob) {
    const objectUrl = URL.createObjectURL(source)
    return { data: objectUrl, objectUrl, filename: 'document.pdf' }
  }

  if (source instanceof Uint8Array) {
    return { data: source.slice(), filename: 'document.pdf' }
  }

  if (source instanceof ArrayBuffer) {
    return { data: source.slice(0), filename: 'document.pdf' }
  }

  throw new Error('[vpdf] unsupported PDF source')
}

export function filenameFromUrl(url: string): string {
  try {
    const path = new URL(url, 'http://localhost').pathname
    const name = path.split('/').pop()
    return name && name.toLowerCase().endsWith('.pdf') ? name : 'document.pdf'
  } catch {
    return 'document.pdf'
  }
}

export function downloadBlob(data: BlobPart, filename: string, mime = 'application/pdf'): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function revokeObjectUrl(url?: string): void {
  if (!url) return
  try {
    URL.revokeObjectURL(url)
  } catch {
    // ignore
  }
}
