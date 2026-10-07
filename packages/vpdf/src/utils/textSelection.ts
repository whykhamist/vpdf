export interface TextPosition {
  pageNumber: number
  charOffset: number
}

export interface TextSelectionSnapshot {
  text: string
  start: TextPosition
  end: TextPosition
}

function getTextLayerForNode(node: Node): Element | null {
  const element = node instanceof Element ? node : node.parentElement
  return element?.closest('.textLayer') ?? null
}

function getPageNumber(textLayer: Element): number | undefined {
  const raw = textLayer.closest('.page')?.getAttribute('data-page-number')
  if (!raw) return undefined
  const pageNumber = Number.parseInt(raw, 10)
  return Number.isFinite(pageNumber) ? pageNumber : undefined
}

function getCharOffset(textLayer: Element, container: Node, offset: number): number | undefined {
  const walker = document.createTreeWalker(textLayer, NodeFilter.SHOW_TEXT)
  let charOffset = 0

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node === container) {
      return charOffset + offset
    }
    charOffset += node.textContent?.length ?? 0
  }

  return undefined
}

function resolveTextPosition(container: Node, offset: number): TextPosition | undefined {
  const textLayer = getTextLayerForNode(container)
  if (!textLayer) return undefined

  const pageNumber = getPageNumber(textLayer)
  const charOffset = getCharOffset(textLayer, container, offset)
  if (pageNumber === undefined || charOffset === undefined) return undefined

  return { pageNumber, charOffset }
}

export function captureTextSelection(): TextSelectionSnapshot | undefined {
  const selection = document.getSelection()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return undefined
  }

  const range = selection.getRangeAt(0)
  const start = resolveTextPosition(range.startContainer, range.startOffset)
  const end = resolveTextPosition(range.endContainer, range.endOffset)
  if (!start || !end) return undefined

  return {
    text: selection.toString(),
    start,
    end,
  }
}

function findTextNodeAt(
  root: ParentNode,
  charOffset: number,
): { node: Text; offset: number } | undefined {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let remaining = charOffset

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const textNode = node as Text
    const length = textNode.textContent?.length ?? 0
    if (remaining <= length) {
      return { node: textNode, offset: remaining }
    }
    remaining -= length
  }

  return undefined
}

export function restoreTextSelection(
  scroll: HTMLElement,
  snapshot: TextSelectionSnapshot,
): boolean {
  const startPage = scroll.querySelector(
    `.page[data-page-number="${snapshot.start.pageNumber}"] .textLayer`,
  )
  const endPage = scroll.querySelector(
    `.page[data-page-number="${snapshot.end.pageNumber}"] .textLayer`,
  )
  if (!startPage || !endPage) return false

  const start = findTextNodeAt(startPage, snapshot.start.charOffset)
  const end = findTextNodeAt(endPage, snapshot.end.charOffset)
  if (!start || !end) return false

  const range = document.createRange()
  range.setStart(start.node, start.offset)
  range.setEnd(end.node, end.offset)

  const selection = document.getSelection()
  if (!selection) return false

  selection.removeAllRanges()
  selection.addRange(range)
  return selection.toString() === snapshot.text
}

export function getSelectionPageNumbers(scroll: HTMLElement): number[] {
  const selection = document.getSelection()
  if (!selection || selection.isCollapsed) return []

  const pages = new Set<number>()
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i)
    for (const textLayer of scroll.querySelectorAll('.textLayer')) {
      if (!range.intersectsNode(textLayer)) continue
      const pageNumber = getPageNumber(textLayer)
      if (pageNumber !== undefined) pages.add(pageNumber)
    }
  }

  return [...pages]
}
