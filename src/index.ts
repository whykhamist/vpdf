import { App, type Plugin } from "vue";
import components from "./components";

import "./style.css";

export const PDFPlugin: Plugin = {
  install: (app: App) => {
    for (const [key, component] of Object.entries(components)) {
      app.component(key, component);
    }
  },
};

export * from "./components";
export * from "./composables";
export * from "./types/pdf";
export default PDFPlugin;
