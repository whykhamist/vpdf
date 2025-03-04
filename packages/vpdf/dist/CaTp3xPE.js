import { defineComponent as P, defineAsyncComponent as c, ref as S, computed as n, createElementBlock as b, openBlock as v, renderSlot as x, createElementVNode as l, createVNode as i, unref as r, createCommentVNode as $ } from "vue";
const j = { class: "relative flex items-center justify-center bg-foreground/5" }, z = { class: "flex-auto" }, M = { class: "px-2" }, D = { class: "flex flex-auto items-center justify-center divide-x divide-foreground/25 px-3 py-1 *:border-foreground/25 first:*:!border-l last:*:!border-r" }, E = { class: "px-2" }, U = { class: "px-2" }, Z = { class: "flex flex-auto items-center justify-end px-3" }, A = {
  key: 0,
  class: "realtive block h-[1em] w-[1em] animate-mltShdSpin overflow-hidden rounded-full -indent-[9999em] text-sm leading-none text-black",
  style: { transform: "translateZ(0)" }
}, q = /* @__PURE__ */ P({
  __name: "index",
  props: {
    page: { type: Number, default: 1 },
    pages: { type: Number, default: 0 },
    scale: { type: Number, default: 1 },
    rotation: {
      type: Number,
      default: 0,
      validator: (t) => t % 90 == 0
    },
    mode: {
      type: String,
      default: "vertical"
    },
    sidebar: { type: Boolean, default: !1 },
    loading: { type: Boolean, default: !1 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: [
    "update:page",
    "update:mode",
    "update:scale",
    "update:sidebar",
    "update:rotation",
    "fitPage"
  ],
  setup(t, { expose: y, emit: k }) {
    const u = c(() => import("./DN-aONkm.js")), N = c(() => import("./BYkTtWNh.js")), V = c(() => import("./DpsDXEMR.js")), s = t, d = k, m = S(), p = n({
      get: () => s.scale,
      set: (e) => d("update:scale", e)
    }), w = n(() => {
      var e;
      return (e = m.value) == null ? void 0 : e.scales;
    }), f = n({
      get: () => s.page,
      set: (e) => d("update:page", e)
    }), g = n({
      get: () => s.sidebar,
      set: (e) => d("update:sidebar", e)
    }), B = n({
      get: () => s.rotation,
      set: (e) => d("update:rotation", e)
    }), C = () => {
      d("update:mode", s.mode == "vertical" ? "horizontal" : "vertical");
    };
    y({
      scales: w
    });
    const h = (e) => {
      const a = (B.value + e) % 360, o = Math.max(-270, Math.min(270, a));
      d("update:rotation", o);
    };
    return (e, a) => (v(), b("div", j, [
      x(e.$slots, "prepend"),
      l("div", z, [
        l("div", M, [
          i(r(u), {
            class: "rounded-lg px-1 py-0.5 text-2xl",
            icon: t.sidebar ? "menu_open" : "menu",
            disabled: t.disabled,
            onClick: a[0] || (a[0] = (o) => g.value = !g.value)
          }, null, 8, ["icon", "disabled"])
        ])
      ]),
      l("div", D, [
        l("div", E, [
          i(r(u), {
            class: "group rounded-lg px-1 py-0.5 text-2xl",
            icon: t.mode == "vertical" ? "table_rows" : "view_column",
            disabled: t.disabled,
            onClick: C
          }, null, 8, ["icon", "disabled"])
        ]),
        i(r(N), {
          modelValue: f.value,
          "onUpdate:modelValue": a[1] || (a[1] = (o) => f.value = o),
          pages: t.pages,
          mode: t.mode,
          disabled: t.disabled
        }, null, 8, ["modelValue", "pages", "mode", "disabled"]),
        i(r(V), {
          ref_key: "zoomer",
          ref: m,
          scale: p.value,
          "onUpdate:scale": a[2] || (a[2] = (o) => p.value = o),
          disabled: t.disabled,
          onFitPage: a[3] || (a[3] = (o) => d("fitPage", o))
        }, null, 8, ["scale", "disabled"]),
        l("div", U, [
          i(r(u), {
            class: "group rounded-lg px-1 py-0.5 text-2xl",
            icon: "rotate_left",
            disabled: t.disabled,
            onClick: a[4] || (a[4] = (o) => h(-90))
          }, null, 8, ["disabled"])
        ])
      ]),
      l("div", Z, [
        t.loading ? (v(), b("span", A)) : $("", !0)
      ]),
      x(e.$slots, "append")
    ]));
  }
});
export {
  q as default
};
//# sourceMappingURL=CaTp3xPE.js.map
