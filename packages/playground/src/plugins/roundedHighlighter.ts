import { onUnmounted } from "vue";
import type { VPdfPluginDefinition } from "@whykhamist/vpdf";

export interface RoundedHighlighterOptions {
  /**
   * How round the ends should be.
   *
   * 1 = fully rounded/capsule
   * 0 = square
   *
   * Default: 1
   */
  endRadius?: number;

  /**
   * Highlight opacity.
   *
   * Default: 0.4
   */
  opacity?: number;

  /**
   * Optional CSS color override.
   *
   * If omitted, PDF.js's existing highlight color is preserved.
   */
  color?: string;

  /**
   * CSS selector for the PDF.js annotation editor layer.
   */
  layerSelector?: string;
}

interface RoundedHighlighterState {
  observer?: MutationObserver;
  style?: HTMLStyleElement;
  cleanup?: () => void;
}

export function RoundedHighlighter(
  options: RoundedHighlighterOptions = {},
): VPdfPluginDefinition<RoundedHighlighterOptions, RoundedHighlighterState> {
  const {
    endRadius = 1,
    opacity = 0.4,
    color,
    layerSelector = ".annotationEditorLayer",
  } = options;

  return {
    id: "rounded-highlighter",
    name: "Rounded Highlighter",
    version: "1.0.0",

    createState: () => ({}),

    setup(ctx) {
      const state = ctx.getPluginState<RoundedHighlighterState>();

      const install = () => {
        const host = ctx.viewerHost.value;

        if (!host) {
          return;
        }

        const layer = host.querySelector<HTMLElement>(layerSelector);

        if (!layer) {
          return;
        }

        /*
         * PDF.js creates the actual highlight geometry using:
         *
         *   .highlightEditor > .internal
         *
         * and applies an SVG clip-path to `.internal`.
         *
         * We leave that geometry alone and use CSS masking/visual
         * treatment for the rounded marker appearance.
         */

        if (!state) {
          return;
        }

        if (!state.style) {
          const style = document.createElement("style");

          style.dataset.vpdfRoundedHighlighter = "true";

          style.textContent = `
            ${layerSelector} .highlightEditor {
              --vpdf-highlight-opacity: ${opacity};
              --vpdf-highlight-radius: ${Math.max(0, Math.min(1, endRadius))};
            }

            ${layerSelector} .highlightEditor > .internal {
              opacity: var(--vpdf-highlight-opacity);
            }

            /*
             * The actual rounding is implemented by the plugin's
             * generated SVG geometry.
             */
            ${layerSelector} .highlightEditor[data-vpdf-rounded="true"] {
              overflow: visible;
            }
          `;

          document.head.appendChild(style);
          state.style = style;
        }

        processLayer(layer);

        const observer = new MutationObserver(() => {
          processLayer(layer);
        });

        observer.observe(layer, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["style", "class"],
        });

        state.observer = observer;

        state.cleanup = () => {
          observer.disconnect();

          layer
            .querySelectorAll<HTMLElement>(
              '.highlightEditor[data-vpdf-rounded="true"]',
            )
            .forEach((editor) => {
              editor.removeAttribute("data-vpdf-rounded");

              const internal = editor.querySelector<HTMLElement>(".internal");

              internal?.style.removeProperty("clip-path");
              internal?.style.removeProperty("background");
              internal?.style.removeProperty("opacity");
            });
        };
      };

      const processLayer = (layer: HTMLElement) => {
        const editors = layer.querySelectorAll<HTMLElement>(".highlightEditor");

        editors.forEach((editor) => {
          if (editor.dataset.vpdfRounded === "true") {
            return;
          }

          roundHighlight(editor);
        });
      };

      const roundHighlight = (editor: HTMLElement) => {
        const internal = editor.querySelector<HTMLElement>(".internal");

        if (!internal) {
          return;
        }

        editor.dataset.vpdfRounded = "true";

        /*
         * Instead of trying to modify PDF.js's clipPath directly,
         * create a rounded visual layer above it.
         */
        const marker = document.createElement("div");

        marker.className = "vpdf-rounded-highlight";

        marker.setAttribute("aria-hidden", "true");

        Object.assign(marker.style, {
          position: "absolute",
          inset: "0",
          pointerEvents: "none",
          borderRadius: `${endRadius * 50}%`,
          background: color ?? "var(--highlight-color, #ffff98)",
          opacity: String(opacity),
          zIndex: "0",
        });

        /*
         * Keep PDF.js's original internal element above/below the
         * marker depending on how the layer is structured.
         */
        internal.style.position = "relative";
        internal.style.zIndex = "1";

        editor.style.position = "absolute";

        editor.insertBefore(marker, internal);
      };

      const disposeReady = ctx.on("onReady", install);

      /*
       * The viewer host can be mounted after setup().
       */
      if (ctx.viewerHost.value) {
        install();
      }

      return () => {
        disposeReady();

        state?.cleanup?.();

        if (state) {
          state.observer?.disconnect();
          state.style?.remove();
        }
      };
    },
  };
}
