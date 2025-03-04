import { defineComponent as u, ref as s, computed as p, onMounted as f, nextTick as m, onBeforeUnmount as d, createElementBlock as E, openBlock as _, normalizeClass as h } from "vue";
const b = /* @__PURE__ */ u({
  __name: "index",
  props: {
    disabled: { type: Boolean, default: !1 }
  },
  setup(i) {
    const v = i, a = s(), o = s(!1), c = p(() => ({
      active: ["focus", "mouseenter"],
      inactive: ["blur", "mouseleave"]
    })), l = () => {
      v.disabled || (o.value = !0);
    }, r = () => {
      o.value = !1;
    };
    return f(() => {
      m(() => {
        c.value.active.forEach((n) => {
          var e, t;
          (t = (e = a.value) == null ? void 0 : e.parentElement) == null || t.addEventListener(n, l);
        }), c.value.inactive.forEach((n) => {
          var e, t;
          (t = (e = a.value) == null ? void 0 : e.parentElement) == null || t.addEventListener(n, r);
        });
      });
    }), d(() => {
      c.value.active.forEach((n) => {
        var e, t;
        (t = (e = a.value) == null ? void 0 : e.parentElement) == null || t.removeEventListener(n, l);
      }), c.value.inactive.forEach((n) => {
        var e, t;
        (t = (e = a.value) == null ? void 0 : e.parentElement) == null || t.removeEventListener(n, r);
      });
    }), (n, e) => (_(), E("div", {
      ref_key: "focusHelper",
      ref: a,
      class: h(["pointer-events-none absolute inset-0 transition-opacity", {
        "opacity-0": !o.value,
        "opacity-20": o.value
      }])
    }, null, 2));
  }
});
export {
  b as _
};
//# sourceMappingURL=_V6eeIlB.js.map
