import { defineComponent as C, defineAsyncComponent as I, ref as p, shallowRef as h, computed as B, watch as R, onMounted as E, onBeforeUnmount as P, createElementBlock as m, openBlock as d, createElementVNode as s, renderSlot as g, createBlock as L, createCommentVNode as w, createVNode as N, normalizeClass as S, unref as V, Transition as F, withCtx as T } from "vue";
const $ = { class: "leading-none" }, q = { class: "relative h-full w-full bg-white leading-none" }, z = ["width", "height"], A = {
  key: 0,
  class: "absolute inset-0 flex items-center bg-black/5"
}, M = /* @__PURE__ */ s("div", { class: "mx-auto" }, [
  /* @__PURE__ */ s("span", {
    class: "realtive block h-[1em] w-[1em] animate-mltShdSpin overflow-hidden rounded-full -indent-[9999em] text-sm leading-none text-black",
    style: { transform: "translateZ(0)" }
  })
], -1), U = [
  M
], j = /* @__PURE__ */ C({
  __name: "vPdfPageRenderer",
  props: {
    pageInfo: {},
    pdf: {},
    textLayer: { type: Boolean, default: !1 },
    render: { type: Boolean, default: !1 },
    onRender: { type: Function, default: () => {
    } },
    onError: {}
  },
  setup(y, { expose: _ }) {
    const b = I(() => import("./nUErmb8O.js")), a = y, t = p(!1), o = p(), i = h(), n = h(), l = B(
      () => {
        var e;
        return (e = o.value) == null ? void 0 : e.getContext("2d", {
          alpha: !1,
          willReadFrequently: !0
        });
      }
    ), u = async () => {
      var e, c;
      if (!t.value && o.value && l.value) {
        t.value = !0;
        const { viewport: f, page: x } = a.pageInfo, { promise: k } = a.pdf, v = await k;
        try {
          n.value = await v.getPage(x);
          const r = {
            canvasContext: l.value,
            viewport: f
          };
          i.value = n.value.render(r), await i.value.promise, o.value && l.value && a.onRender({
            canvas: o.value,
            context: l.value,
            viewport: f,
            doc: v
          });
        } catch (r) {
          (e = a.onError) == null || e.call(a, r), r.name != "RenderingCancelledException";
        } finally {
          t.value = !1, (c = n.value) == null || c.cleanup(!0);
        }
      }
    };
    return R(
      () => a.render,
      async (e) => {
        e && !n.value && await u();
      }
    ), E(async () => {
      a.render && await u();
    }), P(async () => {
      var e;
      t.value && i.value.cancel(), (e = n.value) == null || e.cleanup();
    }), _({
      context: l,
      canvas: o
    }), (e, c) => (d(), m("div", $, [
      s("div", q, [
        g(e.$slots, "prepend"),
        s("canvas", {
          ref_key: "canva",
          ref: o,
          class: S(["box-border h-full w-full border border-gray-400 bg-white outline-none", {
            hidden: t.value
          }]),
          width: e.pageInfo.viewport.width,
          height: e.pageInfo.viewport.height
        }, null, 10, z),
        e.textLayer && n.value ? (d(), L(V(b), {
          key: 0,
          page: n.value,
          pageInfo: e.pageInfo
        }, null, 8, ["page", "pageInfo"])) : w("", !0),
        N(F, {
          "enter-from-class": "opacity-0 blur-sm",
          "leave-to-class": "opacity-0 blur-sm",
          "enter-active-class": "transition",
          "leave-active-class": "transition"
        }, {
          default: T(() => [
            t.value ? (d(), m("div", A, U)) : w("", !0)
          ]),
          _: 1
        }),
        g(e.$slots, "append")
      ])
    ]));
  }
});
export {
  j as default
};
//# sourceMappingURL=BJmGdMqi.js.map
