import type { DocumentInitParameters } from "pdfjs-dist/types/src/display/api";
import type {
  VPdfAssetUrls,
  VPdfDocumentInitOptions,
  VPdfFeatureFlags,
  VPdfGetDocumentParameters,
  VPdfPrepareDocumentInitEvent,
  VPdfSource,
} from "../types";
import type { NormalizedSource } from "./source";

export interface BuildDocumentInitInput {
  assets: Pick<
    VPdfAssetUrls,
    "cMapUrl" | "standardFontDataUrl" | "wasmUrl"
  >;
  features: VPdfFeatureFlags;
  normalized: NormalizedSource;
  source: VPdfSource;
  password?: string;
  viewer?: VPdfDocumentInitOptions;
  perLoad?: VPdfDocumentInitOptions;
  prepare?: (event: VPdfPrepareDocumentInitEvent) => void;
}

function reservedSourceFields(
  normalized: NormalizedSource,
  password?: string,
): Pick<DocumentInitParameters, "url" | "data" | "password"> {
  const fields: Pick<DocumentInitParameters, "url" | "data" | "password"> = {};
  if (typeof normalized.data === "string" || normalized.data instanceof URL) {
    fields.url = normalized.data;
  } else {
    fields.data = normalized.data;
  }
  if (password) fields.password = password;
  return fields;
}

function mergeHttpHeaders(
  viewer?: object,
  perLoad?: object,
): Record<string, unknown> | undefined {
  if (!viewer && !perLoad) return undefined;
  return { ...viewer, ...perLoad };
}

function lockDocumentInit(
  params: VPdfGetDocumentParameters,
  reserved: Pick<DocumentInitParameters, "url" | "data" | "password">,
  enableScripting: boolean,
): void {
  delete params.url;
  delete params.data;
  delete params.password;
  delete params.worker;
  Object.assign(params, reserved);
  params.isEvalSupported = false;
  params.enableScripting = enableScripting;
}

export function buildDocumentInitParameters(
  input: BuildDocumentInitInput,
): VPdfGetDocumentParameters {
  const enableScripting = input.features.scripting === true;
  const reserved = reservedSourceFields(input.normalized, input.password);

  const params: VPdfGetDocumentParameters = {
    cMapUrl: input.assets.cMapUrl,
    cMapPacked: true,
    standardFontDataUrl: input.assets.standardFontDataUrl,
    wasmUrl: input.assets.wasmUrl,
    enableXfa: input.features.xfa !== false,
    isEvalSupported: false,
    disableAutoFetch: false,
    useSystemFonts: true,
    ...reserved,
  };

  Object.assign(params, input.viewer, input.perLoad);
  const httpHeaders = mergeHttpHeaders(
    input.viewer?.httpHeaders as object | undefined,
    input.perLoad?.httpHeaders as object | undefined,
  );
  if (httpHeaders) params.httpHeaders = httpHeaders;

  input.prepare?.({
    params,
    context: { source: input.source, password: input.password },
  });

  lockDocumentInit(params, reserved, enableScripting);
  return params;
}
