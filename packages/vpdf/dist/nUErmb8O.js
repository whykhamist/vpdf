import { defineComponent as h, ref as u, shallowRef as y, onMounted as w, nextTick as C, onBeforeUnmount as M, createElementBlock as _, openBlock as L } from "vue";
import { TextLayer as T } from "pdfjs-dist";
const k = /* @__PURE__ */ h({
  __name: "textLayer",
  props: {
    page: {},
    pageInfo: {}
  },
  setup(f) {
    const l = f, t = u(), a = y(), n = u(), d = async () => {
      if (t.value) {
        a.value && a.value.cancel();
        const { viewport: e } = l.pageInfo, { rotation: o, scale: v } = e, x = await l.page.streamTextContent({
          includeMarkedContent: !0,
          disableNormalization: !0
        });
        a.value = new T({
          textContentSource: x,
          container: t.value,
          viewport: e
        });
        let c = e.width / e.height, r = "";
        Math.abs(o) == 90 && (r += `translateY(${100 / c}%)`), Math.abs(o) == 180 && (r += "translate(100%, 100%)"), Math.abs(o) == 270 && (r += `translateX(${100 * c}%)`), r += `rotate(${o}deg)`;
        let s = t.value.style;
        s.setProperty("--scale-factor", `${v}`), [
          "webkitTransform",
          "mozTransform",
          "msTransform",
          "oTransform",
          "transform"
        ].forEach((i) => {
          s.hasOwnProperty(i) && Object.assign(s, { [i]: r });
        }), await a.value.render(), n.value = document.createElement("div"), n.value.classList.add("endOfContent"), t.value.appendChild(n.value);
      }
    }, m = () => {
      var e;
      (e = n.value) == null || e.classList.add("active");
    }, p = () => {
      var e;
      (e = n.value) == null || e.classList.remove("active");
    };
    return w(() => {
      C(() => {
        d();
      });
    }), M(() => {
      var e;
      (e = a.value) == null || e.cancel();
    }), (e, o) => (L(), _("div", {
      ref_key: "_textLayer",
      ref: t,
      class: "textLayer",
      onMousedown: m,
      onMouseup: p
    }, null, 544));
  }
});
export {
  k as default
};
//# sourceMappingURL=nUErmb8O.js.map
