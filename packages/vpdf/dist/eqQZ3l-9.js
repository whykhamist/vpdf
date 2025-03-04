import { defineComponent as t, createElementBlock as l, openBlock as n, createElementVNode as o, normalizeStyle as a } from "vue";
const r = { class: "relative block overflow-hidden bg-gray-400/25 leading-none" }, c = /* @__PURE__ */ t({
  __name: "index",
  props: {
    value: {
      type: Number,
      default: 0,
      validator: (e) => e >= 0 && e <= 100
    }
  },
  setup(e) {
    return (i, s) => (n(), l("div", r, [
      o("div", {
        class: "absolute left-0 top-0 h-full bg-blue-700 leading-none text-white transition-transform",
        style: a({ width: `${e.value}%` })
      }, null, 4)
    ]));
  }
});
export {
  c as default
};
//# sourceMappingURL=eqQZ3l-9.js.map
