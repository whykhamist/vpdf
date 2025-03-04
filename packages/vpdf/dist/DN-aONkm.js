import { defineComponent as m, defineAsyncComponent as r, createElementBlock as d, openBlock as s, createVNode as b, renderSlot as g, unref as n, createElementVNode as y, createBlock as c, createCommentVNode as t, normalizeClass as a, toDisplayString as C } from "vue";
const _ = ["disabled"], h = { class: "pointer-events-none flex items-center justify-center gap-2 leading-none" }, B = /* @__PURE__ */ m({
  __name: "index",
  props: {
    label: {},
    labelClass: { default: "uppercase leading-none flex-auto text-center" },
    icon: {},
    iconClass: { default: "" },
    iconRight: {},
    iconRightClass: { default: "" },
    disabled: { type: Boolean, default: !1 },
    focusDisabled: { type: Boolean, default: !1 }
  },
  setup(N) {
    const o = r(() => import("./C3bDfqSq.js")), p = r(
      () => import("./Dos70TAg.js")
    ), u = (e) => {
      const i = e.offsetX, f = e.offsetY, l = document.createElement("span");
      l.setAttribute("style", `top: ${f}px; left: ${i}px`), l.className = "bg-white/75 absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-ripple pointer-events-none", e.target.appendChild(l), setTimeout(() => l.remove(), 250);
    };
    return (e, i) => (s(), d("button", {
      class: "relative flex items-center justify-center gap-2 overflow-hidden outline-primary disabled:cursor-not-allowed disabled:text-foreground/30",
      disabled: e.disabled,
      onClick: u
    }, [
      b(n(p), {
        disabled: e.disabled || e.focusDisabled,
        class: "bg-primary"
      }, null, 8, ["disabled"]),
      g(e.$slots, "default", {}, () => [
        y("div", h, [
          e.icon ? (s(), c(n(o), {
            key: `__PDF_BUTTON_ICON_${e.icon}_LEFT__`,
            name: e.icon,
            class: a(e.iconClass)
          }, null, 8, ["name", "class"])) : t("", !0),
          e.label ? (s(), d("span", {
            key: 1,
            class: a(e.labelClass)
          }, C(e.label), 3)) : t("", !0),
          e.iconRight ? (s(), c(n(o), {
            key: `__PDF_BUTTON_ICON_${e.iconRight}_RIGHT__`,
            name: e.iconRight,
            class: a(e.iconRightClass)
          }, null, 8, ["name", "class"])) : t("", !0)
        ])
      ])
    ], 8, _));
  }
});
export {
  B as default
};
//# sourceMappingURL=DN-aONkm.js.map
