import { defineComponent as e, createElementBlock as o, openBlock as a, normalizeClass as r } from "vue";
const i = /* @__PURE__ */ e({
  __name: "index",
  props: {
    name: {}
  },
  setup(s) {
    return (n, t) => (a(), o("i", {
      class: r(["icon leading-none transition-colors", `icon-${n.name}`])
    }, null, 2));
  }
});
export {
  i as default
};
//# sourceMappingURL=C3bDfqSq.js.map
