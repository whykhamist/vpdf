import { defineComponent as u, defineAsyncComponent as p, createElementBlock as i, openBlock as n, createCommentVNode as g, Fragment as d, renderList as f, createBlock as k, unref as _ } from "vue";
const h = { class: "px-3 py-1" }, y = {
  key: 0,
  class: "select-none text-center font-semibold italic text-gray-400/50"
}, P = /* @__PURE__ */ u({
  __name: "index",
  props: {
    outline: {}
  },
  emits: ["changePage"],
  setup(B, { emit: a }) {
    const l = p(() => import("./BUKIdTbM.js")), c = a, m = (e, t = null) => {
      e && c("changePage", { page: e, offset: t });
    };
    return (e, t) => {
      var r;
      return n(), i("div", h, [
        !e.outline || ((r = e.outline) == null ? void 0 : r.length) <= 0 ? (n(), i("div", y, " No Bookmarks ")) : g("", !0),
        (n(!0), i(d, null, f(e.outline, (o) => (n(), k(_(l), {
          key: `${o.page}_${o.title}`,
          outline: o,
          onChangePage: t[0] || (t[0] = (s) => m(s.page, s.offset))
        }, null, 8, ["outline"]))), 128))
      ]);
    };
  }
});
export {
  P as default
};
//# sourceMappingURL=Dr4MB3dR.js.map
