import { defineComponent, h, markRaw, type Component } from "vue";
import {
  addCollection as addOfflineCollection,
  addIcon as addOfflineIcon,
  Icon as OfflineIcon,
} from "@iconify/vue/offline";
import {
  addAPIProvider,
  addCollection as addApiCollection,
  addIcon as addApiIcon,
  Icon as ApiIcon,
  setCustomIconLoader,
  setCustomIconsLoader,
  type IconifyCustomIconLoader,
  type IconifyCustomIconsLoader,
  type IconifyIcon,
  type IconifyJSON,
  type IconProps,
  type PartialIconifyAPIConfig,
} from "@iconify/vue";
import type { VPdfIconSlot, VPdfPluginDefinition } from "@whykhamist/vpdf";
import {
  LUCIDE_DEFAULT_ICONS,
  type BundledIconifyIcon,
} from "./lucideDefaults";
import {
  FILE_ICON_BY_EXT,
  resolveFileIcon,
  type FileIconCategory,
} from "./fileIcons";
import "./styles.css";

export const VPDF_ICONIFY_PLUGIN_ID = "vpdf.iconify";

export type VPdfIconifyIconValue =
  | string
  | BundledIconifyIcon
  | { body: string; width?: number; height?: number };

export type VPdfIconifyIconMap = Partial<
  Record<VPdfIconSlot | (string & {}), VPdfIconifyIconValue>
>;

export interface VPdfIconifyApiOptions {
  providers?: Record<string, PartialIconifyAPIConfig>;
  setCustomIconLoader?: {
    prefix: string;
    provider?: string;
    loader: IconifyCustomIconLoader;
  };
  setCustomIconsLoader?: {
    prefix: string;
    provider?: string;
    loader: IconifyCustomIconsLoader;
  };
}

export interface VPdfIconifyRuntimeOptions {
  collections?: IconifyJSON[];
  icons?: Record<string, IconifyIcon>;
  iconProps?: Partial<IconProps>;
  api?: false | VPdfIconifyApiOptions;
}

export interface VPdfIconifyPluginOptions {
  icons?: VPdfIconifyIconMap;
  /** When true (default), map `file:<ext>` slots to bundled file-type icons. */
  fileIcons?: boolean;
  iconify?: VPdfIconifyRuntimeOptions;
}

export { LUCIDE_DEFAULT_ICONS };
export {
  FILE_ICON_BY_CATEGORY,
  FILE_ICON_BY_EXT,
  FILE_ICON_CATEGORIES,
  fileIconCategory,
  resolveFileIcon,
} from "./fileIcons";

export {
  addAPIProvider,
  addApiCollection,
  addApiIcon,
  setCustomIconLoader,
  setCustomIconsLoader,
};

export const addIcon = addOfflineIcon;
export const addCollection = addOfflineCollection;

function toIconData(icon: Exclude<VPdfIconifyIconValue, string>): IconifyIcon {
  return {
    body: icon.body,
    width: icon.width ?? 24,
    height: icon.height ?? 24,
  };
}

function registerIconData(
  name: string,
  data: IconifyIcon,
  useApi: boolean,
  local: Record<string, IconifyIcon>,
) {
  local[name] = data;
  if (useApi) addApiIcon(name, data);
  else addOfflineIcon(name, data);
}

function registerCollection(
  data: IconifyJSON,
  useApi: boolean,
  local: Record<string, IconifyIcon>,
) {
  if (useApi) addApiCollection(data);
  else addOfflineCollection(data);
  const prefix = data.prefix;
  for (const [name, icon] of Object.entries(data.icons)) {
    local[`${prefix}:${name}`] = icon;
  }
}

function applyIconifyConfig(
  config: VPdfIconifyRuntimeOptions | undefined,
  useApi: boolean,
  local: Record<string, IconifyIcon>,
) {
  for (const [name, data] of Object.entries(config?.icons ?? {})) {
    registerIconData(name, data, useApi, local);
  }
  for (const collection of config?.collections ?? []) {
    registerCollection(collection, useApi, local);
  }

  if (!useApi || !config?.api) return;

  for (const [provider, providerConfig] of Object.entries(
    config.api.providers ?? {},
  )) {
    addAPIProvider(provider, providerConfig);
  }
  const customIcon = config.api.setCustomIconLoader;
  if (customIcon) {
    setCustomIconLoader(
      customIcon.loader,
      customIcon.prefix,
      customIcon.provider,
    );
  }
  const customIcons = config.api.setCustomIconsLoader;
  if (customIcons) {
    setCustomIconsLoader(
      customIcons.loader,
      customIcons.prefix,
      customIcons.provider,
    );
  }
}

function registerBundledIcons(
  useApi: boolean,
  local: Record<string, IconifyIcon>,
) {
  const seen = new Set<string>();
  for (const icon of [
    ...Object.values(LUCIDE_DEFAULT_ICONS),
    ...Object.values(FILE_ICON_BY_EXT),
  ]) {
    const name = `${icon.prefix}:${icon.name}`;
    if (seen.has(name)) continue;
    seen.add(name);
    registerIconData(name, toIconData(icon), useApi, local);
  }
}

function resolveStringIcon(
  name: string,
  local: Record<string, IconifyIcon>,
  useApi: boolean,
): string | IconifyIcon | undefined {
  if (local[name]) return local[name];
  if (useApi) return name;
  return undefined;
}

function resolveSlot(
  name: string,
  icons: Record<string, VPdfIconifyIconValue>,
  fileIcons: boolean,
  local: Record<string, IconifyIcon>,
  useApi: boolean,
): { icon: string | IconifyIcon; fileCategory?: FileIconCategory } | undefined {
  const mapped = icons[name];
  if (mapped) {
    if (typeof mapped === "string") {
      const resolved = resolveStringIcon(mapped, local, useApi);
      if (!resolved) return undefined;
      return { icon: resolved };
    }
    return { icon: toIconData(mapped) };
  }
  if (fileIcons) {
    const file = resolveFileIcon(name);
    if (file)
      return { icon: toIconData(file.icon), fileCategory: file.category };
  }
  return undefined;
}

export function VPdfIconifyPlugin(
  pluginOptions: VPdfIconifyPluginOptions = {},
): VPdfPluginDefinition<VPdfIconifyPluginOptions> {
  const icons: Record<string, VPdfIconifyIconValue> = {
    ...LUCIDE_DEFAULT_ICONS,
    ...pluginOptions.icons,
  };
  const fileIcons = pluginOptions.fileIcons !== false;
  const useApi = typeof pluginOptions.iconify?.api === "object";
  const IconComponent: Component = useApi ? ApiIcon : OfflineIcon;

  return {
    id: VPDF_ICONIFY_PLUGIN_ID,
    name: "Iconify",
    version: "3.0.0",
    options: pluginOptions,
    setup(ctx) {
      const local: Record<string, IconifyIcon> = {};
      registerBundledIcons(useApi, local);
      applyIconifyConfig(pluginOptions.iconify, useApi, local);

      const renderer = markRaw(
        defineComponent({
          name: "VPdfIconifyRenderer",
          inheritAttrs: false,
          props: {
            name: { type: String, required: true },
            fallback: { type: String, default: undefined },
          },
          setup(props, { attrs }) {
            return () => {
              const resolved = resolveSlot(
                props.name,
                icons,
                fileIcons,
                local,
                useApi,
              );
              if (!resolved) {
                if (!props.fallback) return null;
                return h(
                  "span",
                  {
                    class: ["vpdf-icon", "vpdf-icon-fallback", attrs.class],
                    "aria-hidden": "true",
                  },
                  props.fallback,
                );
              }
              const fileClass = resolved.fileCategory
                ? ["vpdf-file-icon", `vpdf-file-icon--${resolved.fileCategory}`]
                : undefined;
              return h(IconComponent, {
                ...pluginOptions.iconify?.iconProps,
                icon: resolved.icon,
                class: [attrs.class, fileClass],
                ssr: pluginOptions.iconify?.iconProps?.ssr ?? true,
                "aria-hidden": true,
              });
            };
          },
        }),
      );

      return ctx.registerIconRenderer(renderer);
    },
  };
}

export { VPdfIconifyPlugin as createIconifyPlugin };
