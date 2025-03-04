import { defineComponent as _, defineAsyncComponent as v, ref as h, computed as y, watch as w, createElementBlock as x, openBlock as C, createElementVNode as t, createVNode as r, unref as u, normalizeClass as n, toDisplayString as V } from "vue";
const P = { class: "flex items-center justify-center gap-2 px-2" }, k = { class: "flex items-center gap-0.5" }, z = ["value", "size", "disabled"], B = /* @__PURE__ */ t("div", { class: "absolute left-1/2 top-full h-0.5 w-0 -translate-x-1/2 bg-blue-600 opacity-0 transition-all group-focus-within:w-full group-focus-within:opacity-100" }, null, -1), E = /* @__PURE__ */ t("span", { class: "leading-none" }, "/", -1), N = { class: "leading-none" }, D = /* @__PURE__ */ _({
  __name: "pager",
  props: {
    modelValue: { default: 1 },
    pages: { default: 0 },
    disabled: { type: Boolean, default: !1 },
    mode: {}
  },
  emits: ["update:modelValue"],
  setup(p, { emit: c }) {
    const s = v(() => import("./DN-aONkm.js")), a = p, i = c, o = h(a.modelValue), g = y(() => Math.max(`${a.pages}`.length, 3)), m = (e) => e % 1 === 0, f = (e) => {
      const l = e.target;
      m(+l.value) && +l.value <= a.pages ? (o.value = +l.value, i("update:modelValue", o.value)) : l.value = o.value.toString();
    }, d = (e) => {
      let l = Math.max(Math.min(a.modelValue + e, a.pages), 1);
      i("update:modelValue", l);
    };
    return w(
      () => a.modelValue,
      (e) => {
        o.value = e;
      }
    ), (e, l) => (C(), x("div", P, [
      t("div", k, [
        r(u(s), {
          onClick: l[0] || (l[0] = (b) => d(-1)),
          icon: "arrow_circle_up",
          class: "group rounded-lg px-1 py-0.5 text-2xl",
          iconClass: {
            "transition-transform": !0,
            "-rotate-90": e.mode != "vertical"
          },
          disabled: e.disabled
        }, null, 8, ["iconClass", "disabled"]),
        r(u(s), {
          onClick: l[1] || (l[1] = (b) => d(1)),
          icon: "arrow_circle_down",
          class: "group rounded-lg px-1 py-0.5 text-2xl",
          iconClass: {
            "transition-transform": !0,
            "-rotate-90": e.mode != "vertical"
          },
          disabled: e.disabled
        }, null, 8, ["iconClass", "disabled"])
      ]),
      t("div", {
        class: n(["hidden select-none items-center justify-stretch gap-1 md:flex", {
          "text-gray-400": e.disabled
        }])
      }, [
        t("label", {
          for: "__PDF__PAGER_INPUT__",
          class: n(["group relative max-w-10 bg-foreground/10 leading-none before:absolute before:inset-x-0 before:top-full before:h-0.5 before:bg-gray-400/25", { "cursor-not-allowed opacity-50": e.disabled }])
        }, [
          t("input", {
            id: "__PDF__PAGER_INPUT__",
            value: o.value,
            size: g.value,
            class: n(["w-full select-none bg-transparent px-1 text-center leading-none outline-none", { "aria-disabled pointer-events-none": e.disabled }]),
            disabled: e.disabled,
            onChange: f
          }, null, 42, z),
          B
        ], 2),
        E,
        t("span", N, V(e.pages), 1)
      ], 2)
    ]));
  }
});
export {
  D as default
};
//# sourceMappingURL=BYkTtWNh.js.map
