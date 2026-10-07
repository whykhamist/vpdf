import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, h, ref } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import VPdfToolbar from '../../src/components/VPdfToolbar.vue'
import { PluginManager } from '../../src/plugins/manager'
import { createDocumentPropertiesPlugin, VPDF_BUILTIN_PLUGIN_IDS } from '../../src/plugins/builtins'
import DocumentPropertiesView from '../../src/plugins/builtins/DocumentPropertiesView.vue'
import { VPdfModal } from '../../src/components/ui'
import {
  DOCUMENT_PROPERTY_FIELDS,
  MISSING_VALUE,
  buildPropertyRows,
  extractDocumentProperties,
  formatFileSize,
  formatPageSizeInches,
  parsePdfDate,
  sanitizeText,
  type DocumentPropertiesSource,
} from '../../src/plugins/builtins/documentPropertiesMeta'
import { createInitialViewerState, DEFAULT_FEATURES, DEFAULT_TOOLBAR } from '../../src/utils/defaults'
import { isPluginItemVisible, pluginItemProps } from '../../src/plugins/resolve'
import { VPDF_ICON_FALLBACKS, VPDF_ICON_SLOTS } from '../../src/icons'
import type { VPdfViewerApi } from '../../src/composables/useVPdfViewer'
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

function createSource(overrides: Partial<DocumentPropertiesSource> & {
  info?: Record<string, unknown>
  contentLength?: number | null
  hasStructTree?: boolean
} = {}): DocumentPropertiesSource {
  const getDownloadInfo = overrides.getDownloadInfo ?? vi.fn(async () => ({ length: 0 }))
  return {
    numPages: overrides.numPages ?? 3,
    getMetadata:
      overrides.getMetadata ??
      (async () => ({
        info: overrides.info ?? {},
        contentLength: overrides.contentLength,
        hasStructTree: overrides.hasStructTree,
      })),
    getMarkInfo: overrides.getMarkInfo ?? (async () => null),
    getDownloadInfo,
  }
}

function rowMap(data: Awaited<ReturnType<typeof extractDocumentProperties>>) {
  return Object.fromEntries(buildPropertyRows(data).map((row) => [row.id, row.value]))
}

describe('document property extraction', () => {
  it('maps the allowlisted PDF.js fields', async () => {
    const source = createSource({
      numPages: 12,
      contentLength: 1_288_192,
      info: {
        Title: 'Report',
        Author: 'Ada',
        Subject: 'Taxes',
        Keywords: 'pdf, test',
        Creator: 'Writer',
        Producer: 'vpdf',
        PDFFormatVersion: '1.7',
        CreationDate: 'D:20240115123000Z',
        ModDate: 'D:20240201100000Z',
        IsLinearized: true,
        EncryptFilterName: 'Standard',
        Custom: { Secret: 'nope' },
        URL: 'https://internal.example/doc.pdf',
      },
      getMarkInfo: async () => ({ Marked: true }),
    })
    const values = rowMap(
      await extractDocumentProperties({
        source,
        page: { view: [0, 0, 612, 792], userUnit: 1, rotate: 0 },
        locale: 'en-US',
      }),
    )
    expect(values.title).toBe('Report')
    expect(values.author).toBe('Ada')
    expect(values.subject).toBe('Taxes')
    expect(values.keywords).toBe('pdf, test')
    expect(values.creator).toBe('Writer')
    expect(values.producer).toBe('vpdf')
    expect(values.pdfVersion).toBe('1.7')
    expect(values.pageCount).toBe('12')
    expect(values.fastWebView).toBe('Yes')
    expect(values.tagged).toBe('Yes')
    expect(values.pageSize).toBe('8.50 × 11.00 in')
    expect(values.fileSize).toContain('1,288,192 bytes')
    expect(values.created).not.toBe(MISSING_VALUE)
    expect(values.modified).not.toBe(MISSING_VALUE)
    expect(Object.values(values).join(' ')).not.toContain('Standard')
    expect(Object.values(values).join(' ')).not.toContain('nope')
    expect(Object.values(values).join(' ')).not.toContain('internal.example')
    expect(DOCUMENT_PROPERTY_FIELDS.map((field) => field.id)).toEqual(Object.keys(values))
  })

  it('uses placeholders for missing or malformed metadata', async () => {
    const values = rowMap(
      await extractDocumentProperties({
        source: createSource({
          info: { Title: '  ', CreationDate: 'not-a-date', IsLinearized: 'yes' },
        }),
      }),
    )
    expect(values.title).toBe(MISSING_VALUE)
    expect(values.created).toBe(MISSING_VALUE)
    expect(values.fastWebView).toBe(MISSING_VALUE)
    expect(values.pageSize).toBe(MISSING_VALUE)
    expect(values.fileSize).toBe(MISSING_VALUE)
    expect(values.pageCount).toBe('3')
  })

  it('parses PDF dates and sanitizes untrusted text', () => {
    const date = parsePdfDate('D:20240115123000Z')
    expect(date?.toISOString()).toBe('2024-01-15T12:30:00.000Z')
    expect(parsePdfDate('Tuesday')).toBeUndefined()
    expect(sanitizeText('  hello\u0000\u0007world  ')).toBe('helloworld')
    expect(sanitizeText('x'.repeat(600))?.length).toBe(512)
    expect(sanitizeText(12)).toBeUndefined()
  })

  it('formats rotated and user-unit page sizes', () => {
    expect(
      formatPageSizeInches({ view: [0, 0, 612, 792], userUnit: 1, rotate: 90 }),
    ).toBe('11.00 × 8.50 in')
    expect(
      formatPageSizeInches({ view: [0, 0, 612, 792], userUnit: 2, rotate: 0 }),
    ).toBe('17.00 × 22.00 in')
  })

  it('resolves file size without forcing a full download when length is known', async () => {
    const getDownloadInfo = vi.fn(async () => ({ length: 99 }))
    await extractDocumentProperties({
      source: createSource({ contentLength: 2048, getDownloadInfo }),
    })
    expect(getDownloadInfo).not.toHaveBeenCalled()
    expect(formatFileSize(512)).toBe('512 bytes')

    const fromProgress = await extractDocumentProperties({
      source: createSource({ getDownloadInfo }),
      progressTotal: 4096,
    })
    expect(fromProgress.fileSize).toContain('4,096 bytes')
    expect(getDownloadInfo).not.toHaveBeenCalled()

    const fromDownload = await extractDocumentProperties({
      source: createSource({
        getDownloadInfo: async () => ({ length: 8192 }),
      }),
    })
    expect(fromDownload.fileSize).toContain('8,192 bytes')
  })

  it('keeps remaining fields when some PDF.js calls fail', async () => {
    const values = rowMap(
      await extractDocumentProperties({
        source: {
          numPages: 2,
          getMetadata: async () => {
            throw new Error('meta failed')
          },
          getMarkInfo: async () => {
            throw new Error('mark failed')
          },
          getDownloadInfo: async () => {
            throw new Error('size failed')
          },
        },
      }),
    )
    expect(values.pageCount).toBe('2')
    expect(values.title).toBe(MISSING_VALUE)
    expect(values.tagged).toBe(MISSING_VALUE)
    expect(values.fileSize).toBe(MISSING_VALUE)
  })

  it('prefers MarkInfo.Marked and falls back to the struct tree flag', async () => {
    const markedFalse = await extractDocumentProperties({
      source: createSource({
        hasStructTree: true,
        getMarkInfo: async () => ({ Marked: false }),
      }),
    })
    expect(markedFalse.tagged).toBe('No')

    const structOnly = await extractDocumentProperties({
      source: createSource({ hasStructTree: true, getMarkInfo: async () => null }),
    })
    expect(structOnly.tagged).toBe('Yes')
  })
})

describe('document properties plugin', () => {
  let wrapper: VueWrapper | undefined

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.replaceChildren()
  })

  function createApi(
    manager: PluginManager,
    state: ReturnType<typeof ref>,
    controller: VPdfViewerController,
    toolbar: VPdfViewerOptions['toolbar'] = {},
  ) {
    return {
      resolvedToolbar: computed(() =>
        toolbar === false ? false : { ...DEFAULT_TOOLBAR, ...toolbar },
      ),
      resolvedFeatures: computed(() => ({ ...DEFAULT_FEATURES })),
      state,
      controller,
      plugins: manager,
    } as unknown as VPdfViewerApi
  }

  async function setup(options: VPdfViewerOptions = {}, loadState: 'idle' | 'ready' = 'ready') {
    const state = ref({ ...createInitialViewerState(), pageCount: 4, loadState })
    const optionRef = ref<VPdfViewerOptions>(options)
    const controller = createMockController()
    const pdf = {
      numPages: 4,
      getMetadata: vi.fn(async () => ({
        info: { Title: 'Ready doc', PDFFormatVersion: '1.7', IsLinearized: false },
        contentLength: 1024,
      })),
      getMarkInfo: vi.fn(async () => ({ Marked: false })),
      getDownloadInfo: vi.fn(async () => ({ length: 1024 })),
    }
    controller.getDocument = vi.fn(() => pdf) as unknown as VPdfViewerController['getDocument']
    controller.getPage = vi.fn(async () => ({
      view: [0, 0, 612, 792],
      userUnit: 1,
      rotate: 0,
    })) as unknown as VPdfViewerController['getPage']
    const manager = new PluginManager(state, optionRef, controller, {
      plugins: [createDocumentPropertiesPlugin()],
    })
    await vi.waitFor(() => expect(manager.menuItemsView.value.length).toBe(1))
    return { manager, controller, state, optionRef, pdf }
  }

  it('registers an overflow menu item that opens the dialog', async () => {
    const { manager, controller, state } = await setup()
    const api = createApi(manager, state, controller)
    wrapper = mount(VPdfToolbar, { props: { api }, attachTo: document.body })
    await wrapper.get('[aria-label="More actions"]').trigger('click')
    const item = wrapper
      .findAll('button[role="menuitem"]')
      .find((button) => button.text().includes('Properties'))
    expect(item).toBeDefined()
    expect(manager.menuItemsView.value[0]?.icon).toBe(VPDF_ICON_SLOTS.properties)
    expect(item!.find('svg').exists()).toBe(true)
    expect(item!.html()).toContain('M3 1.25C1.89543')
    expect(item!.text()).not.toContain(VPDF_ICON_FALLBACKS.properties)
    await item!.trigger('click')
    await flushPromises()
    const modal = manager.modalView.value
    expect(modal).toBeDefined()
    const dialog = mount(VPdfModal, {
      props: {
        busy: Boolean(modal!.busy && (modal!.busy as () => boolean)()),
        restoreFocus: undefined,
      },
      slots: {
        default: () => h(modal!.component, pluginItemProps(modal!)),
      },
      attrs: {
        onClose: () => manager.dismissModal(),
      },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain('Ready doc')
    expect(document.body.querySelectorAll('.vpdf-dialog-meta-row').length).toBeGreaterThan(0)
    expect(document.body.textContent).not.toContain('EncryptFilterName')
    dialog.unmount()
  })

  it('disables the menu until a document is ready', async () => {
    const { manager } = await setup({}, 'idle')
    const item = manager.menuItemsView.value[0]!
    expect(Boolean(item.disabled && (item.disabled as () => boolean)())).toBe(true)
  })

  it('hides when the toolbar flag or plugin is disabled', async () => {
    const hidden = await setup({ toolbar: { documentProperties: false } })
    expect(isPluginItemVisible(hidden.manager.menuItemsView.value[0]!)).toBe(false)

    const { manager } = await setup()
    manager.setEnabled(VPDF_BUILTIN_PLUGIN_IDS.documentProperties, false)
    expect(manager.menuItemsView.value).toEqual([])
    expect(manager.modalView.value).toBeUndefined()
  })
})

describe('DocumentPropertiesView', () => {
  let wrapper: VueWrapper | undefined

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.replaceChildren()
  })

  it('closes from the button, Escape, and backdrop and restores focus', async () => {
    const restore = document.createElement('button')
    restore.textContent = 'More'
    document.body.append(restore)
    restore.focus()
    const onClose = vi.fn()
    wrapper = mount(VPdfModal, {
      props: {
        restoreFocus: restore,
      },
      slots: {
        default: () => h(DocumentPropertiesView, {
          rows: buildPropertyRows({ title: 'A', pageCount: '1' }),
          status: 'ready',
          onClose,
        }),
      },
      attrs: { onClose },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.activeElement).toBe(wrapper.get('[aria-label="Close"]').element)
    expect(wrapper.findAll('.vpdf-dialog-meta-row').length).toBeGreaterThan(0)
    expect(wrapper.get('.vpdf-dialog-meta-row dt').text()).toBe('Title')
    expect(wrapper.get('.vpdf-dialog-meta-row dd').text()).toBe('A')

    const backdrop = wrapper.get('.vpdf-dialog-backdrop')
    await backdrop.trigger('keydown', { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    await wrapper.get('[aria-label="Close"]').trigger('click')
    expect(onClose).toHaveBeenCalledTimes(2)

    await backdrop.trigger('click')
    expect(onClose).toHaveBeenCalledTimes(3)

    wrapper.unmount()
    wrapper = undefined
    expect(document.activeElement).toBe(restore)
  })
})
