import { defineComponent, h, type Component } from 'vue'
import { useVPdfUiComponent } from '../../composables/useVPdfUi'
import type { VPdfUiSlot } from '../../types/ui'

export function defineVPdfUiProxy(slot: VPdfUiSlot, name: string): Component {
  return defineComponent({
    name,
    inheritAttrs: false,
    emits: ['close', 'update:modelValue', 'update:open'],
    setup(_, { attrs, slots, emit }) {
      const resolved = useVPdfUiComponent(slot)
      return () => {
        const extra: Record<string, unknown> = { ...attrs }
        const chain = (key: string, event: 'close' | 'update:modelValue' | 'update:open') => {
          const existing = extra[key]
          extra[key] = (...args: unknown[]) => {
            if (typeof existing === 'function') (existing as (...a: unknown[]) => void)(...args)
            emit(event, ...(args as []))
          }
        }
        chain('onClose', 'close')
        chain('onUpdate:modelValue', 'update:modelValue')
        chain('onUpdate:open', 'update:open')
        return h(resolved.value, extra, slots)
      }
    },
  })
}
