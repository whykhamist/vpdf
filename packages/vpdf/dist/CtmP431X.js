import { defineComponent as m, defineAsyncComponent as i, ref as s, onMounted as g, nextTick as h, createElementBlock as v, openBlock as w, createElementVNode as e, createCommentVNode as c, createVNode as p, unref as u, withDirectives as y, withKeys as P, vModelText as k, toDisplayString as D } from "vue";
const N = { class: "flex w-screen-95 max-w-sm flex-col overflow-hidden rounded-lg border border-gray-400/75 bg-gray-200 text-gray-700 shadow-md" }, S = { class: "flex items-center gap-2 border-b border-gray-400/25 bg-gray-600 px-3 py-1 text-white" }, T = /* @__PURE__ */ e("div", { class: "flex-auto text-lg font-semibold" }, "Password", -1), C = { class: "flex min-h-0 flex-auto flex-col gap-2 overflow-auto bg-white px-3 py-1" }, I = { class: "flex items-center gap-3 rounded-lg border border-amber-400 bg-amber-400/25 px-3 py-1" }, V = /* @__PURE__ */ e("div", { class: "font-semibold leading-tight" }, " The pdf file is protected. Please enter the document's password to continue. ", -1), A = {
  for: "__PDF_PASSWORD_INPUT__",
  class: "mb-3 flex items-center justify-end gap-2"
}, B = /* @__PURE__ */ e("span", null, "Enter Password: ", -1), E = { class: "relative flex items-center gap-2 rounded-lg border border-black/25 bg-white px-2 py-0.5 text-black focus-within:border-blue-700/75" }, F = { class: "absolute top-full text-center text-xs font-semibold text-rose-600" }, O = { class: "flex items-center justify-end gap-2 bg-white px-3 py-2" }, K = /* @__PURE__ */ m({
  __name: "index",
  props: {
    callback: { type: Function },
    reason: {}
  },
  emits: ["close"],
  setup(_, { emit: U }) {
    const b = i(() => import("./C3bDfqSq.js")), f = i(() => import("./DN-aONkm.js")), r = _, n = s(), t = s(), a = s(), l = () => {
      r.callback(t.value);
    };
    return g(() => {
      r.reason > 1 && (a.value = "Invalid Password!"), h(() => {
        var o;
        (o = n.value) == null || o.focus();
      });
    }), (o, d) => (w(), v("div", N, [
      e("div", S, [
        T,
        c("", !0)
      ]),
      e("div", C, [
        e("div", I, [
          p(u(b), {
            name: "warning",
            class: "aspect-square text-5xl text-amber-600"
          }),
          V
        ]),
        e("label", A, [
          B,
          e("div", E, [
            y(e("input", {
              id: "__PDF_PASSWORD_INPUT__",
              ref_key: "inpt",
              ref: n,
              "onUpdate:modelValue": d[1] || (d[1] = (x) => t.value = x),
              type: "password",
              class: "bg-transparent outline-none",
              onKeyup: P(l, ["enter"])
            }, null, 544), [
              [k, t.value]
            ]),
            e("div", F, D(a.value), 1)
          ])
        ])
      ]),
      e("div", O, [
        p(u(f), {
          label: "Ok",
          class: "w-24 rounded-lg border border-gray-400/75 bg-white px-3 py-1 font-bold text-gray-700 hover:border-blue-400",
          onClick: l
        }),
        c("", !0)
      ])
    ]));
  }
});
export {
  K as default
};
//# sourceMappingURL=CtmP431X.js.map
