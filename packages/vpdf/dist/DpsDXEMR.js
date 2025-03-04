import { defineComponent as x, defineAsyncComponent as y, computed as i, createElementBlock as u, openBlock as n, createVNode as c, createElementVNode as v, unref as h, createCommentVNode as C, toDisplayString as p, Fragment as S, renderList as k } from "vue";
const E = { class: "flex items-center justify-center gap-0.5 px-2" }, F = {
  for: "__PDF_SCALE_SELECT__",
  class: "group relative hidden max-w-24 rounded-t-md bg-foreground/10 leading-none before:absolute before:inset-x-0 before:top-full before:h-0.5 before:bg-gray-400/25 md:block"
}, N = ["value", "disabled"], L = ["value"], P = ["value", "hidden", "disabled"], z = /* @__PURE__ */ x({
  __name: "zoomer",
  props: {
    scale: { default: 1 },
    scales: { default: () => [
      { value: 0.25, show: !0 },
      { value: 0.333, show: !1 },
      { value: 0.5, show: !0 },
      { value: 0.584, show: !1 },
      { value: 0.667, show: !1 },
      { value: 0.75, show: !0 },
      { value: 1, show: !0 },
      { value: 1.25, show: !0 },
      { value: 1.5, show: !0 },
      { value: 2, show: !0 },
      { value: 4, show: !0 },
      { value: 8, show: !0 },
      { show: !0 },
      { label: "Fit Page", value: "fit", show: !0 },
      { label: "Fit Width", value: "width", show: !0 },
      { label: "Fit Height", value: "height", show: !0 }
    ] },
    disabled: { type: Boolean }
  },
  emits: ["update:scale", "fitPage"],
  setup(b, { expose: f, emit: m }) {
    const d = y(() => import("./DN-aONkm.js")), r = b, s = m, t = i(
      () => r.scales.filter((e) => {
        if (typeof e.value == "number") {
          let a = +e.value;
          return e !== null && !isNaN(a) && a > 0;
        }
        return !1;
      })
    ), o = i(
      () => t.value.findIndex((e) => e.value === r.scale)
    ), g = () => {
      let e = Math.min(o.value + 1, t.value.length);
      s("update:scale", t.value[e].value);
    }, _ = () => {
      let e = Math.max(o.value - 1, 0);
      s("update:scale", t.value[e].value);
    }, w = (e) => {
      let a = e.target.value;
      isNaN(+a) ? s("fitPage", a) : s("update:scale", +a);
    };
    return f({
      scales: t
    }), (e, a) => (n(), u("div", E, [
      c(h(d), {
        icon: "zoom_out",
        class: "group rounded-lg px-1 py-0.5 text-2xl",
        disabled: o.value == 0 || e.disabled,
        onClick: _
      }, null, 8, ["disabled"]),
      c(h(d), {
        icon: "zoom_in",
        class: "group rounded-lg px-1 py-0.5 text-2xl",
        disabled: o.value == t.value.length - 1 || e.disabled,
        onClick: g
      }, null, 8, ["disabled"]),
      v("label", F, [
        v("select", {
          id: "__PDF_SCALE_SELECT__",
          class: "max-w-full bg-transparent text-center leading-none outline-none",
          value: e.scale,
          disabled: e.disabled,
          onChange: w
        }, [
          o.value <= -1 ? (n(), u("option", {
            key: 0,
            value: e.scale,
            hidden: ""
          }, p((e.scale * 100).toFixed(1).replace(/[.,]0$/, "") + "%"), 9, L)) : C("", !0),
          (n(!0), u(S, null, k(e.scales, (l) => (n(), u("option", {
            key: `${l}`,
            value: l.value,
            hidden: !l.show,
            disabled: l.value == null,
            class: "bg-background"
          }, p(l.label ?? (typeof (l == null ? void 0 : l.value) == "number" ? (l.value * 100).toFixed(1).replace(/[.,]0$/, "") + "%" : "-------------")), 9, P))), 128))
        ], 40, N)
      ])
    ]));
  }
});
export {
  z as default
};
//# sourceMappingURL=DpsDXEMR.js.map
