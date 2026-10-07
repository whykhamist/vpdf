import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";
import { defineConfig } from "vitepress";

const packagesRoot = resolve(import.meta.dirname, "../..");
const repoRoot = resolve(packagesRoot, "..");

function copyPdfjsPublicAssets(): Plugin {
  const require = createRequire(import.meta.url);
  const pdfjsRoot = dirname(require.resolve("pdfjs-dist/package.json"));
  const dest = resolve(import.meta.dirname, "../public/pdfjs");

  return {
    name: "copy-pdfjs-public-assets",
    buildStart() {
      mkdirSync(dest, { recursive: true });
      copyFileSync(
        join(pdfjsRoot, "legacy/build/pdf.worker.min.mjs"),
        join(dest, "pdf.worker.min.mjs"),
      );
      for (const dir of ["cmaps", "standard_fonts", "wasm"] as const) {
        const from = join(pdfjsRoot, dir);
        if (!existsSync(from)) continue;
        cpSync(from, join(dest, dir), { recursive: true });
      }
    },
  };
}

const workspacePkgs = [
  "@whykhamist/vpdf",
  "@whykhamist/vpdf-plugin-page-layout",
  "@whykhamist/vpdf-plugin-print",
  "@whykhamist/vpdf-plugin-open",
  "@whykhamist/vpdf-plugin-iconify",
  "@whykhamist/vpdf-plugin-xfa-thumbnail-raster",
] as const;

export default defineConfig({
  title: "vpdf",
  description:
    "Vue 3 PDF viewer built on PDF.js, with plugins, theming, and opt-in packages.",
  lang: "en-US",
  base: "/vpdf/",
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: "localhostLinks",
  srcExclude: ["README.md"],
  head: [
    ["meta", { name: "theme-color", content: "#2563eb" }],
    ["meta", { name: "color-scheme", content: "light dark" }],
    ["link", { rel: "icon", href: "/vpdf/favicon.svg" }],
    [
      "link",
      {
        rel: "icon",
        href: "/vpdf/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  ],
  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    config: (md) => {
      const defaultFence = md.renderer.rules.fence; // fallback
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info.trim() === "mermaid") {
          // Return our custom Vue component with the encoded code string
          return `<Mermaid code="${token.content}" />`;
        }
        return defaultFence!(tokens, idx, options, env, self);
      };
    },
  },
  vite: {
    plugins: [tailwindcss(), copyPdfjsPublicAssets()],
    resolve: {
      alias: {
        "@whykhamist/vpdf/style.css": resolve(
          packagesRoot,
          "vpdf/src/styles/index.css",
        ),
        "@whykhamist/vpdf-plugin-iconify/style.css": resolve(
          packagesRoot,
          "plugin-iconify/src/styles.css",
        ),
        "@whykhamist/vpdf": resolve(packagesRoot, "vpdf/src/index.ts"),
        "@whykhamist/vpdf-plugin-page-layout": resolve(
          packagesRoot,
          "plugin-page-layout/src/index.ts",
        ),
        "@whykhamist/vpdf-plugin-print": resolve(
          packagesRoot,
          "plugin-print/src/index.ts",
        ),
        "@whykhamist/vpdf-plugin-open": resolve(
          packagesRoot,
          "plugin-open/src/index.ts",
        ),
        "@whykhamist/vpdf-plugin-iconify": resolve(
          packagesRoot,
          "plugin-iconify/src/index.ts",
        ),
        "@whykhamist/vpdf-plugin-xfa-thumbnail-raster": resolve(
          packagesRoot,
          "plugin-xfa-thumbnail-raster/src/index.ts",
        ),
      },
    },
    server: {
      port: 5174,
      strictPort: true,
      fs: {
        allow: [repoRoot],
      },
    },
    optimizeDeps: {
      exclude: [...workspacePkgs],
      include: [
        "pdfjs-dist/legacy/build/pdf.mjs",
        "pdfjs-dist/legacy/web/pdf_viewer.mjs",
      ],
    },
    ssr: {
      noExternal: [...workspacePkgs],
    },
    worker: {
      format: "es",
    },
  },
  themeConfig: {
    siteTitle: "vpdf",
    outline: { level: [2, 3] },
    logo: "/favicon.svg",
    search: {
      provider: "local",
    },
    nav: [
      { text: "Guide", link: "/guide/installation" },
      { text: "Plugins", link: "/plugins/overview" },
      { text: "Examples", link: "/examples/load-files" },
      { text: "Types", link: "/guide/types" },
      {
        text: "Packages",
        items: [
          { text: "@whykhamist/vpdf", link: "/guide/installation" },
          { text: "Open", link: "/plugins/open" },
          { text: "Print", link: "/plugins/print" },
          { text: "Page layout", link: "/plugins/page-layout" },
          { text: "Iconify", link: "/plugins/iconify" },
          { text: "XFA thumbnail raster", link: "/plugins/xfa-thumbnail-raster" },
        ],
      },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Getting started",
          items: [
            { text: "Installation", link: "/guide/installation" },
            { text: "Quick start", link: "/guide/quick-start" },
            { text: "Assets and workers", link: "/guide/assets" },
            { text: "SSR and Nuxt", link: "/guide/ssr" },
          ],
        },
        {
          text: "Viewer",
          items: [
            { text: "VPdfViewer", link: "/guide/viewer" },
            { text: "Options", link: "/guide/options" },
            { text: "Sources", link: "/guide/sources" },
            { text: "Features and toolbar", link: "/guide/features" },
            {
              text: "State and controller",
              link: "/guide/state-and-controller",
            },
            { text: "Navigation and layout", link: "/guide/navigation" },
            { text: "Zoom and gestures", link: "/guide/zoom" },
            { text: "Search", link: "/guide/search" },
            { text: "Sidebar", link: "/guide/sidebar" },
            { text: "Annotations", link: "/guide/annotations" },
            { text: "Password and loading", link: "/guide/loading" },
            { text: "Download and save", link: "/guide/download" },
            { text: "Document properties", link: "/guide/document-properties" },
          ],
        },
        {
          text: "Customization",
          items: [
            { text: "useVPdfViewer", link: "/guide/use-vpdf-viewer" },
            { text: "Theming", link: "/guide/theming" },
            { text: "UI components", link: "/guide/ui" },
            { text: "Icons", link: "/guide/icons" },
            { text: "Accessibility", link: "/guide/accessibility" },
            { text: "Security", link: "/guide/security" },
            { text: "Limitations", link: "/guide/limitations" },
            { text: "Type reference", link: "/guide/types" },
          ],
        },
      ],
      "/plugins/": [
        {
          text: "Plugin system",
          items: [
            { text: "Overview", link: "/plugins/overview" },
            { text: "Writing a plugin", link: "/plugins/writing" },
            { text: "Lifecycle", link: "/plugins/lifecycle" },
            { text: "Plugin context", link: "/plugins/context" },
            { text: "Registration APIs", link: "/plugins/registration" },
            { text: "Events", link: "/plugins/events" },
            { text: "Plugin state", link: "/plugins/state" },
            { text: "UI and modals", link: "/plugins/ui" },
            { text: "Advanced / PluginManager", link: "/plugins/advanced" },
            { text: "Built-in plugins", link: "/plugins/built-ins" },
          ],
        },
        {
          text: "Types",
          items: [
            { text: "Plugin system", link: "/plugins/types/" },
            {
              text: "Extension packages",
              collapsed: false,
              items: [
                { text: "Open", link: "/plugins/types/open" },
                { text: "Print", link: "/plugins/types/print" },
                { text: "Page layout", link: "/plugins/types/page-layout" },
                { text: "Iconify", link: "/plugins/types/iconify" },
                {
                  text: "XFA thumbnail raster",
                  link: "/plugins/types/xfa-thumbnail-raster",
                },
              ],
            },
          ],
        },
        {
          text: "Extension packages",
          items: [
            { text: "Open", link: "/plugins/open" },
            { text: "Print", link: "/plugins/print" },
            { text: "Page layout", link: "/plugins/page-layout" },
            { text: "Iconify", link: "/plugins/iconify" },
            { text: "XFA thumbnail raster", link: "/plugins/xfa-thumbnail-raster" },
          ],
        },
      ],
      "/examples/": [
        {
          text: "Examples",
          items: [
            { text: "Load files and blobs", link: "/examples/load-files" },
            { text: "Host PDFs", link: "/examples/host-pdfs" },
            { text: "Full plugin stack", link: "/examples/all-plugins" },
            { text: "Custom plugin", link: "/examples/custom-plugin" },
            {
              text: "Custom annotation editor",
              link: "/examples/custom-editor",
            },
            { text: "Custom themes", link: "/examples/custom-themes" },
          ],
        },
      ],
    },
    // footer: {
    //   message: "MIT Licensed. Built on PDF.js.",
    //   copyright: "vpdf",
    // },
  },
});
