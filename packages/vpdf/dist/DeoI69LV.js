import { defineComponent as A, defineAsyncComponent as v, ref as p, toRef as K, computed as R, watch as Y, createElementBlock as k, openBlock as f, createVNode as w, createElementVNode as V, unref as r, withCtx as D, createCommentVNode as c, createBlock as P, toDisplayString as j, normalizeClass as q } from "vue";
import { usePdf as G } from "./index.js";
const H = { class: "relative flex h-full flex-col border border-gray-400/25 bg-background text-foreground" }, Q = { class: "absolute inset-x-0 bottom-0" }, T = {
  key: 0,
  class: "absolute top-full z-20 w-full bg-negative px-2 py-1 text-sm font-semibold leading-none text-rose-50"
}, X = { class: "relative flex min-h-0 min-w-0 flex-auto" }, $ = /* @__PURE__ */ A({
  __name: "vPdf",
  props: {
    src: {},
    workerSrc: {},
    smoothJump: { type: Boolean, default: !1 },
    textLayer: { type: Boolean, default: !1 },
    password: {},
    onPassword: {}
  },
  setup(U) {
    const F = v(() => import("./ClWvyr-2.js")), B = v(() => import("./CaTp3xPE.js")), C = v(() => import("./AywIJ4_I.js")), L = v(() => import("./CtmP431X.js")), M = v(() => import("./CWOcVI7O.js")), S = v(() => import("./eqQZ3l-9.js")), u = U, m = p(), b = p(), i = p(), d = p({
      loader: 0,
      viewer: 0
    }), t = p({
      mode: "vertical",
      scale: 1.75,
      sidebar: !1,
      rotation: 0
    }), n = p({
      show: !1,
      data: void 0,
      type: "",
      persistent: !1
    }), I = (o, e, l = !1) => {
      n.value.data = o, n.value.persistent = l, n.value.type = e, n.value.show = !0;
    }, { pdf: g, pages: J, loading: x, outline: z, attachments: E } = G(
      K(() => u.src),
      {
        workerSrc: u.workerSrc,
        password: u.password,
        onPassword: (o, e) => {
          u.onPassword && typeof u.onPassword == "function" ? u.onPassword(o, e) : e >= 1 && I(
            {
              reason: e,
              cb: (l) => {
                o(l), n.value.show = !1;
              }
            },
            "passwordPrompt",
            !0
          );
        },
        onProgress: (o) => {
          d.value.loader = o.loaded / o.total * 85;
        },
        onError: (o) => {
          i.value = o;
        }
      }
    ), N = R(() => ({
      thumbnails: !0,
      bookmarks: !0,
      attachments: !0
    })), O = (o) => {
      d.value.viewer = o.loaded / o.total * 15;
    }, h = (o, e = null) => {
      var l;
      (l = m.value) == null || l.changePage(o, e);
    }, W = (o = "fit") => {
      var e;
      t.value.scale = (e = m.value) == null ? void 0 : e.fitPage(o);
    }, y = (o) => {
      var e;
      if (o.ctrlKey) {
        o.preventDefault();
        const l = (e = b.value) == null ? void 0 : e.scales;
        let s = l.findIndex(
          (a) => a.value == t.value.scale
        );
        o.wheelDeltaY > 0 ? (s = s > -1 ? s : l.findIndex((a) => a.value >= t.value.scale) - 1, s = Math.min(
          s + 1,
          l.filter((a) => !!a.value).length - 1
        )) : (s = s > -1 ? s : l.findLastIndex(
          (a) => a.value <= t.value.scale
        ) + 1, s = Math.max(s - 1, 0)), t.value.scale = l[s].value;
      }
    };
    return Y(
      () => u.src,
      () => {
        d.value = {
          loader: 0,
          viewer: 0
        }, n.value.show = !1, i.value = void 0;
      }
    ), (o, e) => {
      var l, s;
      return f(), k("div", H, [
        w(r(B), {
          ref_key: "menu",
          ref: b,
          pages: r(J),
          page: ((l = m.value) == null ? void 0 : l.currentPage) ?? 1,
          loading: r(x),
          mode: t.value.mode,
          "onUpdate:mode": e[0] || (e[0] = (a) => t.value.mode = a),
          scale: t.value.scale,
          "onUpdate:scale": e[1] || (e[1] = (a) => t.value.scale = a),
          sidebar: t.value.sidebar,
          "onUpdate:sidebar": e[2] || (e[2] = (a) => t.value.sidebar = a),
          rotation: t.value.rotation,
          "onUpdate:rotation": e[3] || (e[3] = (a) => t.value.rotation = a),
          onFitPage: W,
          "onUpdate:page": h
        }, {
          prepend: D(() => [
            V("div", Q, [
              d.value.loader + d.value.viewer < 100 ? (f(), P(r(S), {
                key: 0,
                value: +(d.value.loader + d.value.viewer).toFixed(2),
                class: "h-0.5 w-full"
              }, null, 8, ["value"])) : c("", !0)
            ]),
            i.value ? (f(), k("div", T, j(i.value.message), 1)) : c("", !0)
          ]),
          _: 1
        }, 8, ["pages", "page", "loading", "mode", "scale", "sidebar", "rotation"]),
        V("div", X, [
          i.value ? c("", !0) : (f(), P(r(M), {
            key: 0,
            modelValue: t.value.sidebar,
            "onUpdate:modelValue": e[4] || (e[4] = (a) => t.value.sidebar = a),
            pdf: r(g),
            options: N.value,
            outline: r(z),
            attachments: r(E),
            page: ((s = m.value) == null ? void 0 : s.currentPage) ?? 1,
            rotation: t.value.rotation,
            onChangePage: e[5] || (e[5] = (a) => h(a.page, a.offset))
          }, null, 8, ["modelValue", "pdf", "options", "outline", "attachments", "page", "rotation"])),
          r(g) && !r(x) && !i.value ? (f(), P(r(F), {
            key: 1,
            ref_key: "viewer",
            ref: m,
            pdf: r(g),
            smoothJump: o.smoothJump,
            view: t.value.mode,
            textLayer: o.textLayer,
            rotation: t.value.rotation,
            onProgress: O,
            scale: t.value.scale,
            "onUpdate:scale": e[6] || (e[6] = (a) => t.value.scale = a),
            class: q(["max-h-full min-h-0 min-w-0 flex-auto transition-all", {
              "md:ml-64": t.value.sidebar && !i.value
            }]),
            onWheel: y,
            onMousewheel: y
          }, null, 8, ["pdf", "smoothJump", "view", "textLayer", "rotation", "scale", "class"])) : c("", !0)
        ]),
        w(r(C), {
          modelValue: n.value.show,
          "onUpdate:modelValue": e[7] || (e[7] = (a) => n.value.show = a),
          persistent: n.value.persistent,
          class: "z-20"
        }, {
          default: D(({ close: a }) => [
            w(r(L), {
              callback: n.value.data.cb,
              reason: n.value.data.reason,
              class: ""
            }, null, 8, ["callback", "reason"])
          ]),
          _: 1
        }, 8, ["modelValue", "persistent"])
      ]);
    };
  }
});
export {
  $ as default
};
//# sourceMappingURL=DeoI69LV.js.map
