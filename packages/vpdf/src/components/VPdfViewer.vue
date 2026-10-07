<script setup lang="ts">
import {
  computed,
  markRaw,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  toValue,
  watch,
} from "vue";
import { useVPdfViewer } from "../composables/useVPdfViewer";
import {
  VPDF_CONTROLLER_KEY,
  VPDF_STATE_KEY,
  VPDF_VIEWER_KEY,
} from "../types/context";
import type {
  VPdfAttachmentDownloadEvent,
  VPdfSource,
  VPdfViewerOptions,
} from "../types";
import type { VPdfUiComponents } from "../types/ui";
import type { VPdfPluginsConfig } from "../plugins/types";
import { isPluginItemVisible, pluginItemProps } from "../plugins/resolve";
import { resolvePageGap, resolvePageRadius } from "../utils/pageChrome";
import { VPDF_UI_HOST_KEY } from "../composables/uiDefaults";
import VPdfToolbar from "./VPdfToolbar.vue";
import VPdfSidebar from "./VPdfSidebar.vue";
import { VPdfModal } from "./ui";
import VPdfPasswordForm from "./VPdfPasswordForm.vue";
import VPdfStatus from "./VPdfStatus.vue";
import VPdfPageOverlays from "./VPdfPageOverlays.vue";
import "pdfjs-dist/legacy/web/pdf_viewer.css";

const props = withDefaults(
  defineProps<{
    src?: VPdfSource;
    options?: VPdfViewerOptions;
    plugins?: VPdfPluginsConfig;
    ui?: Partial<VPdfUiComponents>;
  }>(),
  {
    options: () => ({}),
    plugins: () => ({}),
  },
);

const emit = defineEmits<{
  ready: [];
  error: [error: { code: string; message: string }];
  pageChange: [payload: { pageNumber: number; pageCount: number }];
  attachmentDownload: [payload: VPdfAttachmentDownloadEvent];
}>();

const mergedOptions = computed<VPdfViewerOptions>(() => ({
  ...props.options,
  src: props.src ?? props.options?.src,
}));

const options = ref<VPdfViewerOptions>(mergedOptions.value);
watch(
  mergedOptions,
  (value) => {
    options.value = value;
  },
  { deep: true },
);

const api = useVPdfViewer({
  options,
  plugins: props.plugins,
});

const viewerHost = ref<HTMLElement>();

provide(VPDF_VIEWER_KEY, {
  state: api.state,
  options: api.options,
  controller: api.controller,
  plugins: api.plugins,
  pluginContext: undefined as never,
});
provide(VPDF_CONTROLLER_KEY, api.controller);
provide(VPDF_STATE_KEY, api.state);
provide(
  VPDF_UI_HOST_KEY,
  computed(() => props.ui),
);

const showOverlay = computed(
  () =>
    api.state.value.loadState === "loading" ||
    api.state.value.loadState === "idle" ||
    api.state.value.loadState === "error" ||
    api.state.value.loadState === "unsupported",
);

const textLayerEnabled = computed(() => api.resolvedFeatures.value.textLayer);

const topControls = computed(() =>
  api.plugins.controlsView.value.filter(
    (control) =>
      control.region === "viewer-top" && isPluginItemVisible(control),
  ),
);
const bottomControls = computed(() =>
  api.plugins.controlsView.value.filter(
    (control) =>
      control.region === "viewer-bottom" && isPluginItemVisible(control),
  ),
);
const overlayHostControls = computed(() =>
  api.plugins.controlsView.value.filter(
    (control) =>
      control.region === "page-overlay-host" && isPluginItemVisible(control),
  ),
);

const sidebarOverlayOpen = computed(() => {
  if (api.state.value.sidebar === "none") return false;
  return api.plugins.panelsView.value.some(isPluginItemVisible);
});

const PasswordFormRaw = markRaw(VPdfPasswordForm);

const activeModal = computed(() => {
  const request = api.state.value.password;
  if (request) {
    return {
      key: "password",
      component: PasswordFormRaw,
      contentProps: { request },
      busy: false,
      dismissible: false,
      restoreFocus: undefined as HTMLElement | undefined,
      onClose: () => request.cancel(),
    };
  }
  const modal = api.plugins.modalView.value;
  if (!modal) return;
  return {
    key: modal.ownerId,
    component: modal.component,
    contentProps: pluginItemProps(modal),
    busy: Boolean(toValue(modal.busy)),
    dismissible: toValue(modal.dismissible) !== false,
    restoreFocus: modal.restoreFocus,
    onClose: () => api.plugins.dismissModal(),
  };
});

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  if (
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "SELECT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable)
  ) {
    return;
  }

  const shortcut = api.plugins.matchShortcut(event);
  if (shortcut) {
    if (shortcut.preventDefault !== false) event.preventDefault();
    void shortcut.handler(event);
  }
}

const stopAttachmentDownload = api.plugins.on(
  "onAttachmentDownload",
  (payload) => {
    emit("attachmentDownload", payload);
  },
);

onMounted(async () => {
  if (!viewerHost.value) return;
  await api.mount(viewerHost.value);
  window.addEventListener("keydown", onKeydown);

  if (options.value.src) {
    await api.controller.load(options.value.src, options.value.password);
  }
});

onBeforeUnmount(async () => {
  stopAttachmentDownload();
  window.removeEventListener("keydown", onKeydown);
  await api.destroy();
});

watch(
  () => api.state.value.loadState,
  (loadState) => {
    if (loadState === "ready") emit("ready");
  },
);

watch(
  () => api.state.value.error,
  (error) => {
    if (error) emit("error", error);
  },
);

watch(
  () => [api.state.value.pageNumber, api.state.value.pageCount] as const,
  ([pageNumber, pageCount]) => {
    emit("pageChange", { pageNumber, pageCount });
  },
);

const pageGapPx = computed(() =>
  resolvePageGap(options.value.pageGap, api.state.value.scale),
);
const pageRadiusPx = computed(() =>
  resolvePageRadius(options.value.pageRadius, api.state.value.scale),
);

const pageChromeStyle = computed(() => {
  const style: Record<string, string> = {};
  if (pageGapPx.value !== undefined)
    style["--vpdf-page-gap"] = `${pageGapPx.value}px`;
  if (pageRadiusPx.value !== undefined)
    style["--vpdf-page-radius"] = `${pageRadiusPx.value}px`;
  return style;
});

defineExpose({
  controller: api.controller,
  state: api.state,
  plugins: api.plugins,
});
</script>

<template>
  <div
    class="vpdf-root"
    :class="[
      options.class,
      {
        'vpdf-no-text-layer': !textLayerEnabled,
        'vpdf-has-page-gap': pageGapPx !== undefined,
        'vpdf-has-page-radius': pageRadiusPx !== undefined,
      },
    ]"
    :style="pageChromeStyle"
    data-vpdf
  >
    <VPdfToolbar :api="api" />

    <div
      class="vpdf-body"
      :class="{ 'vpdf-sidebar-overlay-open': sidebarOverlayOpen }"
    >
      <VPdfSidebar :api="api" />

      <div class="vpdf-main">
        <div
          v-for="control in topControls"
          :key="control.id"
          class="vpdf-plugin-control"
        >
          <component
            :is="control.component"
            v-bind="pluginItemProps(control)"
          />
        </div>

        <div ref="viewerHost" class="vpdf-viewer-host">
          <div
            class="vpdf-viewer-scroll"
            :class="{ 'vpdf-smooth-jump': options.smoothJump }"
          >
            <div class="vpdf-viewer-pages pdfViewer" />
          </div>

          <VPdfPageOverlays
            :container="viewerHost"
            :overlays="api.plugins.overlaysView.value"
          />

          <div
            v-for="control in overlayHostControls"
            :key="control.id"
            class="vpdf-page-overlay-host"
          >
            <component
              :is="control.component"
              v-bind="pluginItemProps(control)"
            />
          </div>

          <VPdfStatus
            v-if="showOverlay"
            :load-state="api.state.value.loadState"
            :progress="api.state.value.progress"
            :error="api.state.value.error"
          />
        </div>

        <div
          v-for="control in bottomControls"
          :key="control.id"
          class="vpdf-plugin-control"
        >
          <component
            :is="control.component"
            v-bind="pluginItemProps(control)"
          />
        </div>
      </div>
    </div>

    <VPdfModal
      v-if="activeModal"
      :key="activeModal.key"
      :busy="activeModal.busy"
      :dismissible="activeModal.dismissible"
      :restore-focus="activeModal.restoreFocus"
      @close="activeModal.onClose"
    >
      <component
        :is="activeModal.component"
        v-bind="activeModal.contentProps"
        @close="activeModal.onClose"
      />
    </VPdfModal>
  </div>
</template>
