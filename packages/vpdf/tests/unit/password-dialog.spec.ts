import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { h } from 'vue'
import { VPdfModal } from '../../src/components/ui'
import VPdfPasswordDialog from '../../src/components/VPdfPasswordDialog.vue'
import VPdfPasswordForm from '../../src/components/VPdfPasswordForm.vue'
import type { VPdfPasswordRequest } from '../../src/types'

function createRequest(reason: VPdfPasswordRequest['reason'] = 'need'): VPdfPasswordRequest {
  return {
    reason,
    submit: vi.fn(),
    cancel: vi.fn(),
  }
}

describe('password modal', () => {
  let wrapper: VueWrapper | undefined

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.replaceChildren()
  })

  it('focuses the input and submits, cancels, and shows the incorrect state', async () => {
    const request = createRequest()
    wrapper = mount(VPdfModal, {
      slots: {
        default: () => h(VPdfPasswordForm, { request }),
      },
      attrs: {
        onClose: () => request.cancel(),
      },
      attachTo: document.body,
    })
    await flushPromises()

    const input = wrapper.get('input[type="password"]')
    expect(document.activeElement).toBe(input.element)
    expect(wrapper.text()).toContain('This PDF is password protected.')
    expect(wrapper.text()).toContain('Password required')

    await input.setValue('secret')
    await input.trigger('keydown', { key: 'Enter' })
    expect(request.submit).toHaveBeenCalledWith('secret')

    const incorrect = createRequest('incorrect')
    wrapper.unmount()
    wrapper = mount(VPdfModal, {
      slots: {
        default: () => h(VPdfPasswordForm, { request: incorrect }),
      },
      attachTo: document.body,
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Incorrect password. Try again.')
    expect((wrapper.get('input[type="password"]').element as HTMLInputElement).value).toBe('')

    await wrapper.get('button.vpdf-btn-ghost').trigger('click')
    expect(incorrect.cancel).toHaveBeenCalled()
  })

  it('closes from Escape and backdrop via the public wrapper', async () => {
    const request = createRequest()
    wrapper = mount(VPdfPasswordDialog, {
      props: { request },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.activeElement).toBe(wrapper.get('input[type="password"]').element)

    await wrapper.get('.vpdf-dialog-backdrop').trigger('keydown', { key: 'Escape' })
    expect(request.cancel).toHaveBeenCalledTimes(1)

    await wrapper.get('.vpdf-dialog-backdrop').trigger('click')
    expect(request.cancel).toHaveBeenCalledTimes(2)
  })

  it('does not close on Escape or backdrop when dismissible is false', async () => {
    const onClose = vi.fn()
    wrapper = mount(VPdfModal, {
      props: { dismissible: false },
      slots: {
        default: () => h('button', { type: 'button' }, 'Stay'),
      },
      attrs: { onClose },
      attachTo: document.body,
    })
    await flushPromises()
    await wrapper.get('.vpdf-dialog-backdrop').trigger('keydown', { key: 'Escape' })
    await wrapper.get('.vpdf-dialog-backdrop').trigger('click')
    expect(onClose).not.toHaveBeenCalled()
    expect(wrapper.emitted('close')).toBeUndefined()
  })
})
