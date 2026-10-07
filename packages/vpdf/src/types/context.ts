import type { InjectionKey, Ref, ShallowRef } from 'vue'
import type {
  VPdfViewerController,
  VPdfViewerOptions,
  VPdfViewerState,
} from '../types'
import type { PluginManager } from '../plugins/manager'
import type { VPdfPluginContext } from '../plugins/types'

export interface VPdfViewerContext {
  state: Readonly<Ref<VPdfViewerState>>
  options: Readonly<Ref<VPdfViewerOptions>>
  controller: VPdfViewerController
  plugins: PluginManager
  pluginContext: VPdfPluginContext
}

export const VPDF_VIEWER_KEY: InjectionKey<VPdfViewerContext> = Symbol('vpdf-viewer')
export const VPDF_CONTROLLER_KEY: InjectionKey<VPdfViewerController> = Symbol('vpdf-controller')
export const VPDF_STATE_KEY: InjectionKey<Readonly<Ref<VPdfViewerState>>> = Symbol('vpdf-state')

export type { ShallowRef }
