import { markRaw, type InjectionKey, type Ref } from 'vue'
import type { VPdfUiComponents } from '../types/ui'
import Button from '../components/ui/defaults/Button.vue'
import Input from '../components/ui/defaults/Input.vue'
import Select from '../components/ui/defaults/Select.vue'
import Checkbox from '../components/ui/defaults/Checkbox.vue'
import DropdownMenu from '../components/ui/defaults/DropdownMenu.vue'
import Card from '../components/ui/defaults/Card.vue'
import Modal from '../components/ui/defaults/Modal.vue'

export const VPDF_UI_DEFAULTS: VPdfUiComponents = {
  button: markRaw(Button),
  input: markRaw(Input),
  select: markRaw(Select),
  checkbox: markRaw(Checkbox),
  dropdownMenu: markRaw(DropdownMenu),
  card: markRaw(Card),
  modal: markRaw(Modal),
}

export const VPDF_UI_HOST_KEY: InjectionKey<Ref<Partial<VPdfUiComponents> | undefined>> =
  Symbol('vpdf-ui-host')
