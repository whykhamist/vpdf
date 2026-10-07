import type { Component } from "vue";
import { VPDF_PDFJS_ICONS } from "./pdfjsIcons";

export const VPDF_ICON_SLOTS = {
  sidebar: "sidebar",
  previousPage: "previousPage",
  nextPage: "nextPage",
  zoomIn: "zoomIn",
  zoomOut: "zoomOut",
  rotate: "rotate",
  search: "search",
  searchPrevious: "searchPrevious",
  searchNext: "searchNext",
  searchMore: "searchMore",
  searchClose: "searchClose",
  highlight: "highlight",
  freetext: "freetext",
  ink: "ink",
  stamp: "stamp",
  download: "download",
  save: "save",
  more: "more",
  thumbnails: "thumbnails",
  outline: "outline",
  attachments: "attachments",
  open: "open",
  print: "print",
  outlineExpand: "outlineExpand",
  outlineCollapse: "outlineCollapse",
  editorDelete: "editorDelete",
  properties: "properties",
} as const;

export type VPdfIconSlot =
  (typeof VPDF_ICON_SLOTS)[keyof typeof VPDF_ICON_SLOTS];

export const VPDF_ICON_FALLBACKS: Record<VPdfIconSlot, string> = {
  ...VPDF_PDFJS_ICONS,
};

export function isVPdfSvgFallback(value: string | undefined): boolean {
  return !!value && value.trimStart().startsWith("<svg");
}

export interface VPdfIconRendererProps {
  name: string;
  fallback?: string;
}

export type VPdfIconRenderer = Component<VPdfIconRendererProps>;
