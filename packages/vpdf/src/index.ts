import type { App, Plugin } from "vue";
import "./assets/css/style.css";
import components from "./components";

export * from "./components";
export * from "./composables";

export default {
  install(app: App) {
    for (const [key, component] of Object.entries(components)) {
      app.component(key, component);
    }
  },
} satisfies Plugin;
