/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'pdfjs-dist/legacy/build/pdf.mjs' {
  export * from 'pdfjs-dist'
}

declare module 'pdfjs-dist/legacy/web/pdf_viewer.mjs' {
  export class EventBus {
    on(eventName: string, listener: (...args: never[]) => void): void
    off(eventName: string, listener: (...args: never[]) => void): void
    dispatch(eventName: string, data: unknown): void
  }

  export class PDFLinkService {
    externalLinkEnabled: boolean
    constructor(options: {
      eventBus: EventBus
      externalLinkTarget?: number
      externalLinkRel?: string
      ignoreDestinationZoom?: boolean
    })
    setDocument(pdfDocument: unknown, baseUrl?: string | null): void
    setViewer(pdfViewer: unknown): void
    goToDestination(dest: unknown): Promise<void>
  }

  export class PDFFindController {
    constructor(options: { eventBus: EventBus; linkService: PDFLinkService })
  }

  export class PDFViewer {
    currentPageNumber: number
    currentScale: number
    currentScaleValue: string | number
    pagesRotation: number
    scrollMode: number
    spreadMode: number
    annotationEditorMode: { mode: number }
    constructor(options: Record<string, unknown>)
    setDocument(pdfDocument: unknown): void
    pagesCount: number
    getPageView(index: number): {
      div: HTMLDivElement
      height?: number
      viewport?: { width: number; height: number; scale: number; rotation: number; transform: number[] }
    } | undefined
    scrollPageIntoView(params: {
      pageNumber: number
      destArray?: unknown
      ignoreDestinationZoom?: boolean
    }): void
  }
}
