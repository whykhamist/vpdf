import { defineComponent as S, defineAsyncComponent as E, ref as F, computed as O, watch as u, createElementBlock as p, openBlock as f, normalizeClass as j, unref as a, renderSlot as l, createCommentVNode as q, normalizeProps as c, guardReactiveProps as g, normalizeStyle as v, Fragment as A, renderList as D, createVNode as H } from "vue";
import { usePdfViewer as J } from "./index.js";
const K = /* @__PURE__ */ S({
  __name: "vPdfViewer",
  props: {
    pdf: {
      type: Object,
      required: !0
    },
    scale: {
      type: Number,
      default: 1
    },
    gap: {
      type: Number,
      default: 10
    },
    rotation: {
      type: Number,
      default: 0,
      validator: (t) => {
        const n = t % 90 == 0;
        if (!n)
          throw new Error("Rotation must be a multiple of 90");
        return n;
      }
    },
    view: {
      type: String,
      default: "vertical"
    },
    page: {
      type: Number,
      default: 1
    },
    textLayer: {
      type: Boolean,
      default: !1
    },
    smoothJump: {
      type: Boolean,
      default: !1
    },
    renderDelay: {
      type: Number,
      default: 50
    },
    renderOffset: {
      type: Number,
      default: 256
    },
    onProgress: {
      type: Function,
      default: () => {
      }
    }
  },
  emits: ["update:page", "update:scale", "progress"],
  setup(t, { expose: n, emit: x }) {
    const $ = E(
      () => import("./BJmGdMqi.js")
    ), m = t, s = x, y = F(), o = O(() => ({
      numPages: N,
      progress: h,
      pages: B,
      container: i,
      currentPage: w,
      visiblePages: P,
      render: d,
      viewMode: b,
      changePage: C,
      nextPage: L,
      prevPage: V,
      fitWidth: I,
      fitHeight: z,
      fitPage: R
    })), {
      totalPage: N,
      pageInfo: B,
      containerBounds: i,
      progress: h,
      render: d,
      currentPage: w,
      visiblePages: P,
      scale: k,
      viewMode: b,
      nextPage: L,
      prevPage: V,
      changePage: C,
      fitWidth: I,
      fitHeight: z,
      fitPage: R
      // ------------ Unused properties / methods ------------
      // scrollState,
      // rotation,
      // readPDF,
      // getPageInfo,
      // getBounds,
      // getVBounds,
      // getHBounds,
      // getInnerBounds,
      // getGaps,
      // getVisiblePages,
      // boundsIntersecting,
      // onContainerScroll,
      // inRange,
      // getCurrentPage,
      // getFitRatio,
    } = J(y, m);
    return u(h, (e) => {
      m.onProgress(e), s("progress", e);
    }), u(w, (e) => {
      s("update:page", e);
    }), u(k, (e) => {
      s("update:scale", e);
    }), n(o.value), (e, M) => (f(), p("div", {
      ref_key: "container",
      ref: y,
      class: j(["relative grid h-full min-h-0 w-full min-w-0 items-center overflow-scroll bg-foreground/15", {
        "grid items-center": a(b) != "vertical"
      }])
    }, [
      l(e.$slots, "prepend", c(g(o.value))),
      t.pdf ? (f(), p("div", {
        key: 0,
        class: "relative mx-auto",
        style: v({
          width: `${a(i).width}px`,
          height: `${a(i).height}px`
        })
      }, [
        l(e.$slots, "default", c(g(o.value)), () => [
          (f(!0), p(A, null, D(a(P), (r) => l(e.$slots, "renderer", {
            key: r.id,
            pdf: t.pdf,
            pageInfo: r,
            render: a(d)
          }, () => [
            H(a($), {
              pdf: t.pdf,
              pageInfo: r,
              class: "absolute",
              textLayer: t.textLayer,
              render: a(d),
              style: v({
                top: `${r.bounds.inner.top}px`,
                left: `${r.bounds.inner.left}px`,
                width: `${r.viewport.width}px`,
                height: `${r.viewport.height}px`
              })
            }, null, 8, ["pdf", "pageInfo", "textLayer", "render", "style"])
          ])), 128))
        ])
      ], 4)) : q("", !0),
      l(e.$slots, "append", c(g(o.value)))
    ], 2));
  }
});
export {
  K as default
};
//# sourceMappingURL=ClWvyr-2.js.map
