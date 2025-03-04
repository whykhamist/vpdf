import { defineComponent as u, ref as c, createElementBlock as m, createCommentVNode as f, openBlock as p, createElementVNode as s, withModifiers as v, renderSlot as k } from "vue";
const h = {
  key: 0,
  class: "pointer-events-none absolute inset-0"
}, _ = { class: "pointer-events-none relative flex h-full w-full items-center" }, B = /* @__PURE__ */ u({
  __name: "index",
  props: {
    modelValue: { type: Boolean, default: !1 },
    persistent: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue"],
  setup(o, { emit: l }) {
    const i = o, r = l, t = c(), a = (e = !1) => {
      !i.persistent || e ? r("update:modelValue", !1) : d();
    }, d = () => {
      t.value && !t.value.classList.contains("animate-shake") && (t.value.classList.add("animate-shake"), t.value.addEventListener("animationend", () => {
        var e;
        (e = t.value) == null || e.classList.remove("animate-shake");
      }));
    };
    return (e, n) => e.modelValue ? (p(), m("div", h, [
      s("div", _, [
        s("div", {
          class: "pointer-events-auto absolute inset-0 bg-gray-500/25",
          onClick: n[0] || (n[0] = v((V) => a(!1), ["stop"]))
        }),
        s("div", {
          ref_key: "content",
          ref: t,
          class: "pointer-events-auto static z-10 mx-auto"
        }, [
          k(e.$slots, "default", {
            close: () => a(!0)
          })
        ], 512)
      ])
    ])) : f("", !0);
  }
});
export {
  B as default
};
//# sourceMappingURL=AywIJ4_I.js.map
