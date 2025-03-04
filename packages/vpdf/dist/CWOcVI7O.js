import { defineComponent as B, defineAsyncComponent as u, computed as _, ref as w, createElementBlock as l, openBlock as t, createElementVNode as c, createCommentVNode as n, normalizeClass as h, Fragment as x, renderList as P, createBlock as m, unref as s, createVNode as N } from "vue";
const j = { class: "pointer-events-none absolute inset-0 z-10" }, A = { class: "relative h-full w-full" }, O = {
  key: 0,
  class: "flex items-center gap-2 border-b border-r border-accent/25"
}, $ = { class: "flex flex-auto items-center gap-0.5 px-2 py-1" }, z = { class: "flex items-center gap-0.5 px-2 py-1" }, E = {
  key: 1,
  class: "flex-auto overflow-auto border-r border-gray-700/25"
}, I = /* @__PURE__ */ B({
  __name: "index",
  props: {
    modelValue: { type: Boolean, default: !1 },
    options: { default: () => ({
      thumbnails: !0,
      bookmarks: !0,
      attachments: !0
    }) },
    outline: {},
    attachments: {},
    pdf: {},
    page: { default: 1 },
    rotation: { default: 0 }
  },
  emits: ["update:modelValue", "changePage"],
  setup(k, { emit: g }) {
    const f = u(() => import("./DN-aONkm.js")), v = u(() => import("./POOBCQA1.js")), y = u(() => import("./Dr4MB3dR.js")), V = u(
      () => import("./DYig_lRG.js").then((e) => e.i)
    ), o = k, d = g, C = _(() => {
      let e = {};
      return o.options.thumbnails && Object.assign(e, {
        thumbnails: {
          label: "Page Thumbnails",
          icon: "file_copy"
        }
      }), o.options.bookmarks && Object.assign(e, {
        bookmarks: {
          label: "Bookmarks",
          icon: "bookmark_border"
        }
      }), o.options.attachments && Object.assign(e, {
        attachments: {
          label: "Attachments",
          icon: "attachment"
        }
      }), e;
    }), a = w("bookmarks"), b = (e) => {
      e && d("changePage", { page: e.page, offset: e.offset });
    };
    return (e, r) => (t(), l("div", j, [
      c("div", A, [
        o.modelValue ? (t(), l("div", {
          key: 0,
          class: "pointer-events-auto absolute inset-0 block bg-foreground/15 md:hidden",
          onClick: r[0] || (r[0] = (i) => d("update:modelValue", !1))
        })) : n("", !0),
        c("div", {
          class: h(["pointer-events-auto relative flex h-full min-w-0 flex-auto flex-col overflow-hidden bg-background/75 transition-all", {
            "w-0": !o.modelValue,
            "w-64": o.modelValue
          }])
        }, [
          e.modelValue ? (t(), l("div", O, [
            c("div", $, [
              (t(!0), l(x, null, P(C.value, (i, p) => (t(), m(s(f), {
                key: i.label,
                icon: i.icon,
                class: h(["rounded-lg px-1 py-0.5 text-2xl", {
                  "bg-secondary/30": a.value === p,
                  "hover:text-primary": a.value !== p
                }]),
                onClick: (T) => a.value = p
              }, null, 8, ["icon", "class", "onClick"]))), 128))
            ]),
            c("div", z, [
              N(s(f), {
                icon: "close",
                class: "rounded-full p-1",
                onClick: r[1] || (r[1] = (i) => d("update:modelValue", !1))
              })
            ])
          ])) : n("", !0),
          e.modelValue ? (t(), l("div", E, [
            e.options.thumbnails && a.value == "thumbnails" && e.pdf ? (t(), m(s(v), {
              key: 0,
              pdf: e.pdf,
              page: e.page,
              rotation: e.rotation,
              onChangePage: b
            }, null, 8, ["pdf", "page", "rotation"])) : n("", !0),
            a.value == "bookmarks" ? (t(), m(s(y), {
              key: 1,
              outline: e.outline,
              onChangePage: b
            }, null, 8, ["outline"])) : n("", !0),
            a.value == "attachments" ? (t(), m(s(V), {
              key: 2,
              attachments: e.attachments
            }, null, 8, ["attachments"])) : n("", !0)
          ])) : n("", !0)
        ], 2)
      ])
    ]));
  }
});
export {
  I as default
};
//# sourceMappingURL=CWOcVI7O.js.map
