import { describe, expect, it } from 'vitest'

import { captureTextSelection, restoreTextSelection } from '../../src/utils/textSelection'

function createViewerDom(): HTMLDivElement {
  const scroll = document.createElement('div')
  const page = document.createElement('div')
  page.className = 'page'
  page.setAttribute('data-page-number', '1')

  const textLayer = document.createElement('div')
  textLayer.className = 'textLayer'

  const hello = document.createElement('span')
  hello.textContent = 'Hello'
  const world = document.createElement('span')
  world.textContent = ' world'

  textLayer.append(hello, world)
  page.append(textLayer)
  scroll.append(page)
  document.body.append(scroll)
  return scroll
}

describe('textSelection utils', () => {
  it('captures and restores a single-page selection', () => {
    const scroll = createViewerDom()
    const textLayer = scroll.querySelector('.textLayer')!
    const hello = textLayer.querySelector('span:first-child')!
    const world = textLayer.querySelector('span:last-child')!
    const startNode = hello.firstChild as Text
    const endNode = world.firstChild as Text

    const range = document.createRange()
    range.setStart(startNode, 0)
    range.setEnd(endNode, endNode.textContent?.length ?? 0)

    const selection = document.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)

    const snapshot = captureTextSelection()
    expect(snapshot?.text).toBe('Hello world')

    selection.removeAllRanges()
    expect(restoreTextSelection(scroll, snapshot!)).toBe(true)
    expect(selection.toString()).toBe('Hello world')

    scroll.remove()
  })
})
