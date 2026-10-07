import type { Component, InjectionKey } from 'vue'

export const VPDF_UI_SLOTS = [
  'button',
  'input',
  'select',
  'checkbox',
  'dropdownMenu',
  'card',
  'modal',
] as const

export type VPdfUiSlot = (typeof VPDF_UI_SLOTS)[number]

export type VPdfUiComponents = Record<VPdfUiSlot, Component>

export const VPDF_MODAL_TITLE_ID = 'vpdf-modal-title'

export const VPDF_MODAL_TITLE_ID_KEY: InjectionKey<string> = Symbol('vpdf-modal-title-id')
