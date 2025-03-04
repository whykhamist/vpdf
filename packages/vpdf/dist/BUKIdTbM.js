import { defineComponent as v, defineAsyncComponent as d, ref as b, createElementBlock as s, openBlock as l, createCommentVNode as p, createVNode as i, unref as r, withCtx as y, createElementVNode as c, toDisplayString as h } from "vue";
const k = { class: "relative select-none py-1 pl-6 leading-none" }, C = {
  key: 0,
  class: "absolute left-0 top-0.5 flex aspect-square w-6 items-center justify-center leading-none"
}, _ = { class: "pointer-events-none flex flex-auto items-center break-all text-start text-sm leading-tight" }, w = {
  key: 1,
  class: "-ml-3 py-2"
}, x = { class: "border-y border-l border-gray-400/50" }, N = /* @__PURE__ */ v({
  __name: "bookmarkItem",
  props: {
    outline: {}
  },
  emits: ["changePage"],
  setup(P, { emit: f }) {
    const a = d(() => import("./DN-aONkm.js")), m = d(() => import("./Dr4MB3dR.js")), g = f, n = b(!1), u = (e, t = null) => {
      e && g("changePage", { page: e, offset: t });
    };
    return (e, t) => (l(), s("div", k, [
      e.outline.sub.length > 0 ? (l(), s("div", C, [
        i(r(a), {
          icon: "arrow_right",
          class: "rounded-md px-2 py-1 font-bold",
          iconClass: {
            "w-4 aspect-square transition-transform": !0,
            "rotate-90": n.value
          },
          onClick: t[0] || (t[0] = (o) => n.value = !n.value)
        }, null, 8, ["iconClass"])
      ])) : p("", !0),
      i(r(a), {
        focusDisabled: "",
        class: "w-full px-1 hover:underline",
        onClick: t[1] || (t[1] = (o) => u(e.outline.page, { y: e.outline.offsetY, x: e.outline.offsetX }))
      }, {
        default: y(() => [
          c("div", _, h(e.outline.title), 1)
        ]),
        _: 1
      }),
      e.outline.sub.length > 0 && n.value ? (l(), s("div", w, [
        c("div", x, [
          i(r(m), {
            outline: e.outline.sub,
            onChangePage: t[2] || (t[2] = (o) => u(o.page, o.offset))
          }, null, 8, ["outline"])
        ])
      ])) : p("", !0)
    ]));
  }
});
export {
  N as default
};
//# sourceMappingURL=BUKIdTbM.js.map
