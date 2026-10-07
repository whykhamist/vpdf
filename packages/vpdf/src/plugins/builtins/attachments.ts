import { computed, markRaw } from "vue";
import type { VPdfPluginContext, VPdfPluginDefinition } from "../types";
import { isFeatureEnabled } from "../resolve";
import { VPDF_BUILTIN_PLUGIN_IDS } from "./ids";
import { VPDF_ICON_SLOTS } from "../../icons";
import { downloadBlob } from "../../utils/source";
import AttachmentsPanel from "./AttachmentsPanel.vue";

const AttachmentsPanelRaw = markRaw(AttachmentsPanel);

async function saveAttachment(
  ctx: VPdfPluginContext,
  id: string,
  filename: string,
) {
  const doc = ctx.getDocument();
  if (!doc) return;
  try {
    const content = await doc.getAttachmentContent(id);
    if (!content) return;
    const copy = new Uint8Array(content.byteLength);
    copy.set(content);
    const mime =
      ctx.state.value.attachments.find((file) => file.id === id)?.contentType ??
      "application/octet-stream";
    downloadBlob(copy, filename, mime);
  } catch (error) {
    console.error("[vpdf] attachment download failed", error);
  }
}

async function requestAttachmentDownload(
  ctx: VPdfPluginContext,
  id: string,
  filename: string,
) {
  if (ctx.options.value.allowAttachmentDownload !== false) {
    await saveAttachment(ctx, id, filename);
    return;
  }
  const attachment = ctx.state.value.attachments.find((file) => file.id === id) ?? {
    id,
    filename,
  };
  ctx.emit("onAttachmentDownload", {
    attachment,
    download: () => saveAttachment(ctx, id, filename),
  });
}

export function VPdfAttachmentsPlugin(): VPdfPluginDefinition {
  return {
    id: VPDF_BUILTIN_PLUGIN_IDS.attachments,
    name: "Attachments",
    setup(ctx) {
      return ctx.registerPanel({
        id: "attachments",
        label: "Files",
        icon: VPDF_ICON_SLOTS.attachments,
        order: 30,
        visible: () => isFeatureEnabled(ctx.options.value, "attachments"),
        component: AttachmentsPanelRaw,
        props: computed(() => ({
          attachments: ctx.state.value.attachments,
          onDownload: (id: string, filename: string) =>
            requestAttachmentDownload(ctx, id, filename),
        })),
      });
    },
  };
}
