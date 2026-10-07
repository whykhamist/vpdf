export const MISSING_VALUE = '—'
export const TEXT_MAX_LENGTH = 512

export type DocumentPropertyId =
  | 'title'
  | 'author'
  | 'subject'
  | 'keywords'
  | 'created'
  | 'modified'
  | 'creator'
  | 'producer'
  | 'pdfVersion'
  | 'fileSize'
  | 'pageSize'
  | 'tagged'
  | 'pageCount'
  | 'fastWebView'

export interface DocumentPropertyRow {
  id: DocumentPropertyId
  label: string
  value: string
}

export const DOCUMENT_PROPERTY_FIELDS: ReadonlyArray<{
  id: DocumentPropertyId
  label: string
}> = [
  { id: 'title', label: 'Title' },
  { id: 'author', label: 'Author' },
  { id: 'subject', label: 'Subject' },
  { id: 'keywords', label: 'Keywords' },
  { id: 'created', label: 'Created' },
  { id: 'modified', label: 'Modified' },
  { id: 'creator', label: 'Application' },
  { id: 'producer', label: 'PDF producer' },
  { id: 'pdfVersion', label: 'PDF version' },
  { id: 'fileSize', label: 'File size' },
  { id: 'pageSize', label: 'Page size' },
  { id: 'tagged', label: 'Tagged PDF' },
  { id: 'pageCount', label: 'Number of pages' },
  { id: 'fastWebView', label: 'Fast Web View' },
]

export interface ExtractedDocumentProperties {
  title?: string
  author?: string
  subject?: string
  keywords?: string
  created?: string
  modified?: string
  creator?: string
  producer?: string
  pdfVersion?: string
  fileSize?: string
  pageSize?: string
  tagged?: string
  pageCount?: string
  fastWebView?: string
}

export interface DocumentPropertiesPage {
  view: number[]
  userUnit: number
  rotate: number
}

export interface DocumentPropertiesSource {
  numPages: number
  getMetadata(): Promise<{
    info?: Record<string, unknown>
    contentLength?: number | null
    hasStructTree?: boolean
  }>
  getMarkInfo(): Promise<{ Marked?: boolean } | null>
  getDownloadInfo(): Promise<{ length: number }>
}

const PDF_DATE_RE = new RegExp(
  '^D:' +
    '(\\d{4})' +
    '(\\d{2})?' +
    '(\\d{2})?' +
    '(\\d{2})?' +
    '(\\d{2})?' +
    '(\\d{2})?' +
    '([Z|+\\-])?' +
    '(\\d{2})?' +
    "'?" +
    '(\\d{2})?' +
    "'?",
)

/** Matches pdfjs-dist `PDFDateString.toDateObject` (PDF 32000-1:2008 7.9.4). */
export function parsePdfDate(input: string): Date | undefined {
  if (!input) return undefined
  const matches = PDF_DATE_RE.exec(input)
  if (!matches) return undefined
  const year = Number.parseInt(matches[1]!, 10)
  let month = Number.parseInt(matches[2] ?? '', 10)
  month = month >= 1 && month <= 12 ? month - 1 : 0
  let day = Number.parseInt(matches[3] ?? '', 10)
  day = day >= 1 && day <= 31 ? day : 1
  let hour = Number.parseInt(matches[4] ?? '', 10)
  hour = hour >= 0 && hour <= 23 ? hour : 0
  let minute = Number.parseInt(matches[5] ?? '', 10)
  minute = minute >= 0 && minute <= 59 ? minute : 0
  let second = Number.parseInt(matches[6] ?? '', 10)
  second = second >= 0 && second <= 59 ? second : 0
  const universalTimeRelation = matches[7] || 'Z'
  let offsetHour = Number.parseInt(matches[8] ?? '', 10)
  offsetHour = offsetHour >= 0 && offsetHour <= 23 ? offsetHour : 0
  let offsetMinute = Number.parseInt(matches[9] ?? '', 10) || 0
  offsetMinute = offsetMinute >= 0 && offsetMinute <= 59 ? offsetMinute : 0
  if (universalTimeRelation === '-') {
    hour += offsetHour
    minute += offsetMinute
  } else if (universalTimeRelation === '+') {
    hour -= offsetHour
    minute -= offsetMinute
  }
  return new Date(Date.UTC(year, month, day, hour, minute, second))
}

export function sanitizeText(value: unknown, max = TEXT_MAX_LENGTH): string | undefined {
  if (typeof value !== 'string') return undefined
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
  if (!cleaned) return undefined
  return cleaned.length > max ? cleaned.slice(0, max) : cleaned
}

export function formatPdfDate(input: unknown, locale?: string): string | undefined {
  const raw = sanitizeText(input)
  if (!raw) return undefined
  const date = parsePdfDate(raw)
  if (!date || Number.isNaN(date.getTime())) return undefined
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(date)
  } catch {
    return date.toISOString()
  }
}

export function formatFileSize(bytes: number): string {
  const formatted = bytes.toLocaleString()
  if (bytes < 1024) return `${formatted} bytes`
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024
    return `${kb.toFixed(kb < 10 ? 1 : 0)} KB (${formatted} bytes)`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB (${formatted} bytes)`
}

export function formatPageSizeInches(page: DocumentPropertiesPage): string | undefined {
  const [x1, y1, x2, y2] = page.view
  if (![x1, y1, x2, y2].every((value) => typeof value === 'number' && Number.isFinite(value))) {
    return undefined
  }
  const userUnit = Number.isFinite(page.userUnit) && page.userUnit > 0 ? page.userUnit : 1
  const changeOrientation = page.rotate % 180 !== 0
  const width = ((x2! - x1!) / 72) * userUnit
  const height = ((y2! - y1!) / 72) * userUnit
  if (!(width > 0) || !(height > 0)) return undefined
  const displayWidth = changeOrientation ? height : width
  const displayHeight = changeOrientation ? width : height
  return `${displayWidth.toFixed(2)} × ${displayHeight.toFixed(2)} in`
}

export function formatYesNo(value: boolean | undefined): string | undefined {
  if (typeof value !== 'boolean') return undefined
  return value ? 'Yes' : 'No'
}

export function buildPropertyRows(
  data: ExtractedDocumentProperties,
): DocumentPropertyRow[] {
  return DOCUMENT_PROPERTY_FIELDS.map((field) => ({
    id: field.id,
    label: field.label,
    value: data[field.id] || MISSING_VALUE,
  }))
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function readPositiveNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined
}

async function resolveFileSizeBytes(
  source: DocumentPropertiesSource,
  contentLength: unknown,
  progressTotal?: number,
): Promise<number | undefined> {
  const fromMeta = readPositiveNumber(contentLength)
  if (fromMeta) return fromMeta
  const fromProgress = readPositiveNumber(progressTotal)
  if (fromProgress) return fromProgress
  try {
    const info = await source.getDownloadInfo()
    return readPositiveNumber(info?.length)
  } catch {
    return undefined
  }
}

export async function extractDocumentProperties(options: {
  source: DocumentPropertiesSource
  page?: DocumentPropertiesPage
  progressTotal?: number
  locale?: string
}): Promise<ExtractedDocumentProperties> {
  const { source, page, progressTotal, locale } = options
  const extracted: ExtractedDocumentProperties = {
    pageCount: String(source.numPages),
  }

  let info: Record<string, unknown> = {}
  let contentLength: number | null | undefined
  let hasStructTree: boolean | undefined

  try {
    const metadata = await source.getMetadata()
    info = metadata?.info && typeof metadata.info === 'object' ? metadata.info : {}
    contentLength = metadata?.contentLength
    hasStructTree = metadata?.hasStructTree
  } catch {
    // keep going with other sources
  }

  extracted.title = sanitizeText(info.Title)
  extracted.author = sanitizeText(info.Author)
  extracted.subject = sanitizeText(info.Subject)
  extracted.keywords = sanitizeText(info.Keywords)
  extracted.creator = sanitizeText(info.Creator)
  extracted.producer = sanitizeText(info.Producer)
  extracted.pdfVersion = sanitizeText(info.PDFFormatVersion)
  extracted.created = formatPdfDate(info.CreationDate, locale)
  extracted.modified = formatPdfDate(info.ModDate, locale)
  extracted.fastWebView = formatYesNo(readBoolean(info.IsLinearized))

  try {
    const markInfo = await source.getMarkInfo()
    extracted.tagged = formatYesNo(
      typeof markInfo?.Marked === 'boolean' ? markInfo.Marked : hasStructTree,
    )
  } catch {
    extracted.tagged = formatYesNo(hasStructTree)
  }

  if (page) extracted.pageSize = formatPageSizeInches(page)

  const bytes = await resolveFileSizeBytes(source, contentLength, progressTotal)
  if (bytes !== undefined) extracted.fileSize = formatFileSize(bytes)

  return extracted
}
