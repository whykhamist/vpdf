import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";

const router = createRouter({
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash && !!document.querySelector(to.hash)) {
      let el = document.querySelector(to.hash);
      let y = (el?.getBoundingClientRect().top ?? 0) + (window.scrollY - 200);
      nextTick(() => {
        return {
          top: y,
          behavior: "smooth",
        };
      });
    } else {
      if (to.path != from.path) return { top: 0, left: 0, behavior: "smooth" };
    }
  },
  history: createWebHistory("/vpdf/"),
  routes,
});

export default router;
