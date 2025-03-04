import { defineComponent as u, defineAsyncComponent as n, ref as h, watch as b, createBlock as g, createCommentVNode as y, openBlock as v, unref as s, withCtx as a, createVNode as w, normalizeStyle as C, normalizeClass as k, createElementVNode as x, toDisplayString as P } from "vue";
const V = { class: "pointer-events-none absolute -bottom-5 w-full text-center text-sm font-semibold" }, N = /* @__PURE__ */ u({
  __name: "index",
  props: {
    pdf: {},
    page: {},
    rotation: {}
  },
  emits: ["changePage"],
  setup(p, { emit: d }) {
    const i = n(
      () => import("./BJmGdMqi.js")
    ), l = n(() => import("./ClWvyr-2.js")), c = p, m = d, o = h();
    return b(
      () => c.page,
      (t) => {
        var r;
        (r = o.value) == null || r.changePage(t);
      }
    ), (t, r) => t.pdf ? (v(), g(s(l), {
      key: 0,
      ref_key: "thumbs",
      ref: o,
      pdf: t.pdf,
      scale: 0.18,
      gap: 15,
      renderOffset: 50,
      rotation: t.rotation,
      class: "bg-transparent"
    }, {
      renderer: a(({ pageInfo: e, render: f }) => [
        w(s(i), {
          pdf: t.pdf,
          pageInfo: e,
          render: f,
          textLayer: !1,
          class: k(["absolute cursor-pointer select-none rounded-lg border border-dashed px-1 py-0.5 transition-colors hover:border-blue-500 hover:bg-gray-400/25", {
            "border-blue-500": e.page === t.page,
            "border-transparent": e.page !== t.page
          }]),
          style: C({
            top: `${e.bounds.inner.top}px`,
            left: `${e.bounds.inner.left}px`,
            width: `${e.viewport.width}px`,
            height: `${e.viewport.height}px`
          }),
          onClick: (_) => m("changePage", { page: e.page, offset: null })
        }, {
          append: a(() => [
            x("div", V, P(e.page), 1)
          ]),
          _: 2
        }, 1032, ["pdf", "pageInfo", "render", "class", "style", "onClick"])
      ]),
      _: 1
    }, 8, ["pdf", "rotation"])) : y("", !0);
  }
});
export {
  N as default
};
//# sourceMappingURL=POOBCQA1.js.map
