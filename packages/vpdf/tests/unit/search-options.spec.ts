import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { PluginManager } from '../../src/plugins/manager'
import { VPdfSearchPlugin } from '../../src/plugins/builtins'
import { pluginItemProps } from '../../src/plugins/resolve'
import SearchBar from '../../src/plugins/builtins/SearchBar.vue'
import {
  canAdvanceFind,
  isMatchRecountFindType,
  queryFromSelectedText,
  SEARCH_QUERY_MAX_LENGTH,
  searchPatchFromFindControlState,
  toggleSearchOption,
} from '../../src/plugins/builtins/searchOptions'
import { createInitialSearchState, createInitialViewerState } from '../../src/utils/defaults'
import type { VPdfViewerController, VPdfViewerOptions } from '../../src/types'

function createMockController(): VPdfViewerController {
  return {
    load: vi.fn(),
    close: vi.fn(),
    goToPage: vi.fn(),
    nextPage: vi.fn(),
    previousPage: vi.fn(),
    goToDestination: vi.fn(),
    setScale: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    rotate: vi.fn(),
    setSidebar: vi.fn(),
    setAnnotationEditorMode: vi.fn(),
    updateAnnotationEditor: vi.fn(),
    deleteSelectedAnnotation: vi.fn(),
    find: vi.fn(),
    findNext: vi.fn(),
    findPrevious: vi.fn(),
    clearFind: vi.fn(),
    downloadOriginal: vi.fn(),
    saveModified: vi.fn(),
    getDocument: vi.fn(),
    getPage: vi.fn(),
    getPageGeometry: vi.fn(),
    getState: vi.fn(),
    getExperimentalViewer: vi.fn(),
  }
}

async function createManager() {
  const state = ref(createInitialViewerState())
  const optionRef = ref<VPdfViewerOptions>({})
  const controller = createMockController()
  const manager = new PluginManager(state, optionRef, controller, {
    plugins: [VPdfSearchPlugin()],
  })
  await vi.waitFor(() => expect(manager.shortcutsView.value.length).toBeGreaterThan(1))
  return { manager, controller, state }
}

async function openSearch(manager: PluginManager) {
  const open = manager.matchShortcut(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true }))
  expect(open?.id).toContain('find-ctrl')
  await open?.handler(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true }))
}

describe('search option helpers', () => {
  it('builds the matching PDF.js find event when an option is toggled', () => {
    const search = createInitialSearchState()
    expect(toggleSearchOption(search, 'caseSensitive', 'Hello')).toEqual({
      query: 'Hello',
      caseSensitive: true,
      entireWord: false,
      highlightAll: true,
      matchDiacritics: false,
      findPrevious: false,
      type: 'casesensitivitychange',
    })
    expect(toggleSearchOption(search, 'highlightAll', 'Hello').type).toBe('highlightallchange')
    expect(toggleSearchOption(search, 'matchDiacritics', 'Hello').matchDiacritics).toBe(true)
    expect(toggleSearchOption(search, 'entireWord', 'Hello').entireWord).toBe(true)
  })

  it('advances only when the current query already has matches', () => {
    const search = {
      ...createInitialSearchState(),
      query: 'Hello',
      matchCount: 2,
      status: 'found' as const,
    }
    expect(canAdvanceFind(search, 'Hello')).toBe(true)
    expect(canAdvanceFind(search, 'Other')).toBe(false)
  })

  it('zeros match counts when PDF.js reports not-found', () => {
    expect(searchPatchFromFindControlState(1, { current: 0, total: 0 })).toEqual({
      status: 'not-found',
      matchCount: 0,
      currentMatch: 0,
    })
    expect(searchPatchFromFindControlState(1)).toEqual({
      status: 'not-found',
      matchCount: 0,
      currentMatch: 0,
    })
    expect(searchPatchFromFindControlState(0, { current: 2, total: 5 })).toEqual({
      status: 'found',
      matchCount: 5,
      currentMatch: 2,
    })
    expect(isMatchRecountFindType('entirewordchange')).toBe(true)
    expect(isMatchRecountFindType('highlightallchange')).toBe(false)
  })

  it('normalizes and truncates selected text for find', () => {
    expect(queryFromSelectedText('  hello\n\nworld  ')).toBe('hello world')
    expect(queryFromSelectedText('   \n  ')).toBe('')
    expect(queryFromSelectedText('a'.repeat(SEARCH_QUERY_MAX_LENGTH + 50))).toBe(
      'a'.repeat(SEARCH_QUERY_MAX_LENGTH),
    )
  })
})

function mountSearchBar(
  search = createInitialSearchState(),
  handlers: Partial<{
    onQuery: (value: string) => void
    onFind: (findPrevious: boolean) => void
    onToggleOption: (option: string) => void
    onClose: () => void
  }> = {},
) {
  return mount(SearchBar, {
    props: {
      search,
      onQuery: handlers.onQuery ?? vi.fn(),
      onFind: handlers.onFind ?? vi.fn(),
      onToggleOption: handlers.onToggleOption ?? vi.fn(),
      onClose: handlers.onClose ?? vi.fn(),
    },
  })
}

describe('search bar options', () => {
  it('toggles highlight all from the options menu and Alt+A', async () => {
    const onToggleOption = vi.fn()
    const wrapper = mountSearchBar(createInitialSearchState(), { onToggleOption })

    await wrapper.get('[aria-label="Search options"]').trigger('click')
    await wrapper.get('[aria-label="Highlight All (Alt+A)"]').trigger('change')
    expect(onToggleOption).toHaveBeenCalledWith('highlightAll')

    wrapper.element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'c', altKey: true, bubbles: true, cancelable: true }),
    )
    expect(onToggleOption).toHaveBeenCalledWith('caseSensitive')
  })

  it('disables next and previous until the current query has matches', async () => {
    const wrapper = mountSearchBar({
      ...createInitialSearchState(),
      query: 'trace',
      matchCount: 0,
      status: 'not-found',
    })

    expect(wrapper.get('[aria-label="Previous match"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[aria-label="Next match"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[aria-live="polite"]').text()).toBe('Phrase not found')
    expect(wrapper.get('input[type="search"]').attributes('aria-invalid')).toBe('true')

    await wrapper.setProps({
      search: {
        ...createInitialSearchState(),
        query: 'trace',
        matchCount: 3,
        currentMatch: 1,
        status: 'found',
      },
    })

    expect(wrapper.get('[aria-label="Previous match"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('[aria-label="Next match"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('[aria-live="polite"]').text()).toBe('1 / 3')
    expect(wrapper.get('input[type="search"]').attributes('aria-invalid')).toBeUndefined()
  })
})

function mockSelection(text: string | undefined) {
  vi.spyOn(document, 'getSelection').mockReturnValue(
    text === undefined ? null : ({ toString: () => text } as Selection),
  )
}

describe('search plugin shortcuts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('ignores find-next until the search bar is open', async () => {
    const { manager } = await createManager()
    expect(manager.matchShortcut(new KeyboardEvent('keydown', { key: 'g', ctrlKey: true }))).toBeUndefined()
  })

  it('dispatches option changes and find-next while search is open', async () => {
    const { manager, controller } = await createManager()
    await openSearch(manager)

    const control = manager.controlsView.value.find((item) => item.id.endsWith(':bar'))
    expect(control).toBeDefined()
    const props = pluginItemProps(control!)
    ;(props.onQuery as (value: string) => void)('resume')
    ;(props.onToggleOption as (option: string) => void)('matchDiacritics')

    expect(controller.find).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'resume',
        matchDiacritics: true,
        type: 'diacriticmatchingchange',
      }),
    )

    const next = manager.matchShortcut(new KeyboardEvent('keydown', { key: 'g', ctrlKey: true }))
    expect(next?.id).toContain('next-ctrl')
    await next?.handler(new KeyboardEvent('keydown', { key: 'g', ctrlKey: true }))
    expect(controller.find).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'resume', findPrevious: false }),
    )

    const highlight = manager.matchShortcut(new KeyboardEvent('keydown', { key: 'a', altKey: true }))
    await highlight?.handler(new KeyboardEvent('keydown', { key: 'a', altKey: true }))
    expect(controller.find).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'highlightallchange', highlightAll: false }),
    )

    const wholeWord = manager.matchShortcut(new KeyboardEvent('keydown', { key: 'w', altKey: true }))
    await wholeWord?.handler(new KeyboardEvent('keydown', { key: 'w', altKey: true }))
    expect(controller.find).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'entirewordchange', entireWord: true }),
    )
  })

  it('fills the search field from the selection and runs find', async () => {
    mockSelection('  selected\n\nphrase  ')
    const { manager, controller } = await createManager()
    await openSearch(manager)

    const control = manager.controlsView.value.find((item) => item.id.endsWith(':bar'))
    const props = pluginItemProps(control!)
    expect((props.search as { query: string }).query).toBe('selected phrase')
    expect(controller.find).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'selected phrase', findPrevious: false }),
    )
  })

  it('truncates a long selection before find', async () => {
    const selected = 'a'.repeat(SEARCH_QUERY_MAX_LENGTH + 50)
    mockSelection(selected)
    const { manager, controller } = await createManager()
    await openSearch(manager)

    const truncated = 'a'.repeat(SEARCH_QUERY_MAX_LENGTH)
    const control = manager.controlsView.value.find((item) => item.id.endsWith(':bar'))
    const props = pluginItemProps(control!)
    expect((props.search as { query: string }).query).toBe(truncated)
    expect(controller.find).toHaveBeenCalledWith(expect.objectContaining({ query: truncated }))
  })

  it('opens search without find when nothing is selected', async () => {
    mockSelection('')
    const { manager, controller } = await createManager()
    await openSearch(manager)

    const control = manager.controlsView.value.find((item) => item.id.endsWith(':bar'))
    expect(control).toBeDefined()
    expect(pluginItemProps(control!).search).toEqual(expect.objectContaining({ query: '' }))
    expect(controller.find).not.toHaveBeenCalled()
  })
})
